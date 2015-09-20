# coding=utf-8
import django_filters
from rest_framework import renderers, serializers, viewsets, permissions, mixins, status, filters, generics
from rest_framework.decorators import api_view, detail_route, list_route
from rest_framework.response import Response
from rest_framework.reverse import reverse

from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated

from django.contrib.auth.models import User
from django.db import transaction
from oauth2_provider.ext.rest_framework import TokenHasReadWriteScope, TokenHasScope

from process.models import *
from history.models import History
from django.db.models import Q
from django.shortcuts import render

from workflow.models import Workflow
from tasks.models import Task

from tasks.api import GenericTaskSerializer

from utils.api_related import create_serializer, AliasOrderingFilter

from django.http import Http404

import json

from django.shortcuts import get_object_or_404

from tasks.export import ResultExporter

from django.http import HttpResponse, StreamingHttpResponse

from wkhtmltopdf.views import PDFTemplateView, PDFTemplateResponse

from django.conf import settings


@api_view(('GET',))
def root(request, format=None):
    return Response({
        #'User Listing   ': reverse('user-list', request=request, format=format),
    })

'''
#############################################################################################

Process related api calls available

#############################################################################################
'''

class ProcessTaskUserSerializer(serializers.ModelSerializer):
    '''Serializer to handle :class:`process.models.ProcessTaskUser` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    user_repr = serializers.SerializerMethodField()

    class Meta:
        model = ProcessTaskUser
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        exclude = ('id', 'processtask')
        extra_kwargs = {'hash': {'required': False}}

    def get_user_repr(self, obj):
        '''Returns a textual representation of the user playing the action.

            Preferably the user full name, but falling back to the email in case this does not exist.
        '''
        tmp = unicode(obj.user.get_full_name())

        if not tmp:
            tmp = obj.user.email

        return tmp

class PTUWithResult(ProcessTaskUserSerializer):
    '''Serializer to handle :class:`process.models.ProcessTaskUser` objects serialization/deserialization.

    This serializer, beside the usual fields, also includes the result, as nested serializer.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    result = serializers.SerializerMethodField()

    def get_result(self, obj):
        result = obj.getResult()
        if result:
            serializer = result.get_serializer()

            return serializer.to_representation(result)

        return None

class ProcessTaskSerializer(serializers.ModelSerializer):
    '''Serializer to handle :class:`process.models.ProcessTask` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    task = serializers.SlugRelatedField(slug_field='hash', queryset=Task.objects)
    task_repr = serializers.SerializerMethodField()

    users =PTUWithResult(many=True, required=False)
    deadline_repr = serializers.SerializerMethodField()

    class Meta:
        model = ProcessTask
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        exclude = ('process', 'removed')
        extra_kwargs = {'hash': {'required': False}}

    def get_deadline_repr(self, obj):
        '''
            Returns a ISO 8601 formatted date representation for this processtask deadline
        '''
        return obj.deadline.strftime("%Y-%m-%dT%H:%M")

    def get_task_repr(self, obj):
        '''
            Returns a textual representation for the task this process task represents
        '''
        return obj.task.title

    @transaction.atomic
    def create(self, validated_data):
        '''
            Handles the creation of ProcessTask entries.

            Returns the created ProcessTask object
        '''
        users_data = None

        try:
            users_data = validated_data.pop('users')
        except KeyError:
            pass

        processtask = ProcessTask.objects.create(**validated_data)

        # create user tasks (if any are passed by this webservice)
        if users_data:
            for user_data in users_data:
                user_data['processtask'] = processtask
                serializer = ProcessTaskUserSerializer()

                ptu = serializer.create(user_data)

        users = []
        auths = processtask.users().order_by('user').distinct('user')

        for ptu in auths:
            users.append(ptu.user)

        History.new(event=History.ADD, actor=processtask.process.executioner, object=processtask, authorized=users, related=[processtask.process])


        return processtask

    @transaction.atomic
    def update(self, instance, validated_data):
        '''
            Handles the update of ProcessTask entries.

            Returns the updated ProcessTask object
        '''
        users_data = None

        try:
            users_data = validated_data.pop('users')
        except KeyError:
            pass

        if users_data:
            for user_data in users_data:
                user_data['processtask'] = instance
                user_serializer = ProcessTaskUserSerializer()

                try:
                    t_instance = ProcessTaskUser.objects.get(processtask=user_data['processtask'])

                    user_serializer.update(t_instance, user_data)

                except (ProcessTaskUser.DoesNotExist, KeyError):
                    ptu=user_serializer.create(user_data)


        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance

# Serializers define the API representation.
class ProcessSerializer(serializers.ModelSerializer):
    '''Serializer to handle :class:`process.models.Process` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    tasks = ProcessTaskSerializer(many=True, required=False)
    workflow = serializers.SlugRelatedField(slug_field='hash', queryset=Workflow.objects)
    start_date = serializers.SerializerMethodField()
    object_repr = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    status_repr = serializers.SerializerMethodField()

    class Meta:
        model = Process
        exclude = ('id', 'removed')
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        extra_kwargs = {'hash': {'required': False}}

    def get_progress(self, obj):
        '''
            Returns the process completion percentage, calculated from completed tasks
        '''
        return obj.progress()

    def get_start_date(self, obj):
        '''
            Returns a ISO 8601 formatted date representation for this process start date
        '''
        return obj.start_date.strftime("%Y-%m-%d %H:%M")

    def get_object_repr(self, obj):
        '''
            Returns a textual representation of this Process workflow
        '''
        return unicode(obj.workflow)

    def get_status_repr(self, obj):
        '''
            Returns a textual representation of this process current status
        '''
        return Process.statusCode(obj.status)

    @transaction.atomic
    def create(self, validated_data):
        '''
            Handles the creation of Process entries.

            Returns the created Process object
        '''
        tasks_data = None

        try:
            tasks_data = validated_data.pop('tasks')
        except KeyError:
            pass

        process = Process.objects.create(**validated_data)

        # create tasks (if any are passed by this webservice)
        if tasks_data:
            for task_data in tasks_data:
                task_data['process'] = process
                serializer = ProcessTaskSerializer()

                serializer.create(task_data)

        # This will start non-dependant tasks immediately
        process.move()

        return process

    @transaction.atomic
    def update(self, instance, validated_data):
        '''
            Handles the update of Process entries.

            Returns the updated Process object
        '''
        tasks_data = None

        try:
            tasks_data = validated_data.pop('tasks')
        except KeyError:
            pass

        if tasks_data:
            for task_data in tasks_data:
                task_data['process'] = instance
                task_serializer = ProcessTaskSerializer()

                try:
                    t_instance = ProcessTask.objects.get(task=task_data['task'], process=task_data['process'])

                    task_serializer.update(t_instance, task_data)

                except (ProcessTask.DoesNotExist, KeyError):
                    task_serializer.create(task_data)


        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance


class DetailProcessSerializer(serializers.ModelSerializer):
    '''Serializer to handle :class:`process.models.Process` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    tasks = ProcessTaskSerializer(many=True)
    workflow = serializers.SlugRelatedField(slug_field='hash', queryset=Workflow.objects)

    class Meta:
        model = Process
        exclude = ('id', 'removed')
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

class ProcessFilter(django_filters.FilterSet):
    '''
        Process Filter that allows to filter the process viewset by a variety of fields
        such as `workflow`, `hash`, `start_date`, `end_date` ,`status` and `executioner`.
    '''
    class Meta:
        model = Process
        fields = ['workflow', 'hash', 'start_date', 'end_date', 'status', 'executioner']

# ViewSets define the view behavior.
class ProcessViewSet(  mixins.CreateModelMixin,
                        mixins.UpdateModelMixin,
                        mixins.ListModelMixin,
                        mixins.RetrieveModelMixin,
                        mixins.DestroyModelMixin,
                        viewsets.GenericViewSet):
    """
    API for Process manipulation

        Note: All methods on this class pertain to user owned processes
    """
    queryset = Process.objects.none()
    serializer_class = ProcessSerializer
    lookup_field = 'hash'

    filter_backends = [filters.DjangoFilterBackend, AliasOrderingFilter]
    filter_class = ProcessFilter
    ordering_map = {
        'object_repr': 'workflow__title'
    }

    ordering_fields = ('workflow', 'hash', 'start_date', 'end_date', 'status', 'executioner', 'object_repr')

    def get_queryset(self):
        return Process.all(executioner=self.request.user)

    def list(self, request, *args, **kwargs):
        """
        Return a list of user-owned processes

        """
        return super(ProcessViewSet, self).list(request, args, kwargs)


    def create(self, request, *args, **kwargs):
        """
        Insert a new process

        """
        request.data[u'executioner'] = request.user.id

        serializer, headers = create_serializer(self, request)

        History.new(event=History.ADD, actor=request.user, object=serializer.instance)

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """
        Update an already existing process

        """
        request.data[u'executioner'] = request.user.id

        instance = self.get_object()

        serializer = ProcessSerializer(instance=instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        History.new(event=History.EDIT, actor=request.user, object=instance)

        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a process, by id

        """
        instance = self.get_object()

        History.new(event=History.ACCESS, actor=request.user, object=instance)

        return Response(ProcessSerializer(instance).data)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        """
        Logical delete a process, by id
        """
        instance = self.get_object()

        instance.removed = True
        instance.save()

        instance.cancel()

        History.new(event=History.DELETE, actor=request.user, object=instance)

        return Response(status=status.HTTP_204_NO_CONTENT)

    @detail_route(methods=['get'])
    def cancel(self, request, hash=None):
        """
        Cancel a process, marking all current executing and waiting tasks as canceled.
        """
        process = self.get_object()
        process.cancel()

        History.new(event=History.CANCEL, actor=request.user, object=process)

        return Response(ProcessSerializer(process).data)

    @detail_route(methods=['post'])
    def adduser(self, request, hash=None):
        """
        Add a new user to a process, for a task that is either executing or waiting execution.
        """
        process = self.get_object()

        ptask = None
        user = None
        try:
            ptask = ProcessTask.all(process=process).get(hash=request.data['ptask'])
        except:
            pass

        try:
            user = User.objects.get(id=request.data['user'])
        except:
            pass

        if ptask and user:
            try:
                ptaskuser = ProcessTaskUser.objects\
                        .get(processtask=ptask,
                             user=user
                        )


            except ProcessTaskUser.DoesNotExist:
                ptaskuser = ProcessTaskUser(user=user, processtask=ptask)
                ptaskuser.save()

                History.new(event=History.ADD, actor=ptask.process.executioner, object=ptask, authorized=[ptaskuser.user], related=[ptask.process])

                return Response(ProcessSerializer(process).data)

        return Response(status=status.HTTP_400_BAD_REQUEST)


    @detail_route(methods=['post'])
    def changedeadline(self, request, hash=None):
        """
        Change the deadline for a process task conclusion
        """
        process = self.get_object()

        ptask = None
        deadline = request.data.get('deadline', None)
        try:
            ptask = ProcessTask.all(process=process).get(hash=request.data.get('ptask', None))
        except:
            pass

        if ptask and deadline:
            pt = ProcessTaskSerializer(ptask, data={'deadline': deadline}, partial=True)

            pt.is_valid(raise_exception=True)
            pt.save()

            users = [process.executioner]
            auths = ptask.users().order_by('user').distinct('user')

            for ptu in auths:
                if ptu.user != process.executioner:
                    users.append(ptu.user)

            History.new(event=History.EDIT, actor=process.executioner,
                object=ptask, authorized=users, related=[process])

            return Response(ProcessSerializer(process).data)

        return Response({'error': 'unknown'}, status=status.HTTP_400_BAD_REQUEST)

    @detail_route(methods=['post'])
    def canceluser(self, request, hash=None):
        """
        Cancel a specific user task on a process task.
        """
        try:
            ptask = ProcessTaskUser.objects\
                    .get(processtask__hash=request.data['ptask'],
                         user__id=request.data['user']
                    )

            if request.data['val'] == True:
                ptask.reassign()
            else:
                ptask.assign()

        except ProcessTaskUser.DoesNotExist, KeyError:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        return Response(ProcessSerializer(self.get_object()).data)

class MyProcessTaskSerializer(serializers.ModelSerializer):
    '''Serializer to handle :class:`process.models.ProcessTask` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    type = serializers.SerializerMethodField()
    process = serializers.SerializerMethodField()
    process_repr = serializers.SerializerMethodField()
    parent = serializers.SerializerMethodField()
    task = serializers.SlugRelatedField(slug_field='hash', queryset=Task.objects)

    deadline_repr = serializers.SerializerMethodField()

    def get_deadline_repr(self, obj):
        return obj.deadline.strftime("%Y-%m-%dT%H:%M")

    def get_type(self, obj):
        return Task.objects.get_subclass(id=obj.task.id).type()

    def get_process(self, obj):
        return obj.process.hash

    def get_process_repr(self, obj):
        return obj.process.__unicode__()

    def get_parent(self, obj):
        return GenericTaskSerializer(Task.objects.get_subclass(id=obj.task.id)).data

    class Meta:
        model = ProcessTask
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        exclude = ('process', 'removed')
        extra_kwargs = {'hash': {'required': False}}

class MyProcessTaskUserSerializer(ProcessTaskUserSerializer):
    processtask = MyProcessTaskSerializer()
    task_repr = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    deadline = serializers.SerializerMethodField()

    def get_task_repr(self, obj):
        return obj.processtask.task.title

    def get_type(self, obj):
        return Task.objects.get_subclass(id=obj.processtask.task.id).type()

    def get_deadline(self, obj):
        return obj.processtask.deadline

class MyProcessTaskUserDetailSerializer(ProcessTaskUserSerializer):
    processtask = MyProcessTaskSerializer()
    requests = serializers.SerializerMethodField()
    task_repr = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    deadline = serializers.SerializerMethodField()
    dependencies = serializers.SerializerMethodField()

    def get_task_repr(self, obj):
        return obj.processtask.task.title

    def get_type(self, obj):
        return Task.objects.get_subclass(id=obj.processtask.task.id).type()

    def get_deadline(self, obj):
        return obj.processtask.deadline

    def get_requests(self, obj):
        return SimpleRequestSerializer(obj.requests() ,many=True).data

    def get_dependencies(self, obj):
        task_deps = obj.processtask.task.dependencies().filter(dependency__output_resources=True).values_list('dependency')
        process = obj.processtask.process

        return ProcessTaskSerializer(ProcessTask.all().filter(process=process, task__in=task_deps), many=True).data

class MyTasks(generics.ListAPIView):
    """
        Returns a list of user attributed process tasks across all processes
    """
    queryset = ProcessTaskUser.objects.none()
    serializer_class = MyProcessTaskUserSerializer
    filter_backends = (filters.DjangoFilterBackend, AliasOrderingFilter)
    ordering_fields = ('user', 'title', 'task', 'task_repr', 'type', 'deadline', 'reassigned', 'reassign_date', 'finished', 'process','processtask')
    ordering_map = {
        'task': 'processtask__task__hash',
        'process': 'processtask__process__hash',
        'processtask': 'processtask_hash',
        'title': 'processtask__task__title',
        'deadline': 'processtask__deadline',
        'type': 'processtask__task__ttype',
        'task_repr': 'processtask__task__title'
    }

    def get_queryset(self):
        """
            Retrieves a list of user assigned process tasks
        """
        ptasks = ProcessTaskUser.all(finished=False).filter(
                Q(processtask__status=ProcessTask.RUNNING),
                user=self.request.user,
            ).order_by('processtask__deadline') #.values_list('processtask')

        #return ProcessTask.all().filter(id__in=ptasks).order_by('deadline')
        return ptasks

class MyFutureTasks(generics.ListAPIView):
    """
        Returns a list of user attributed process tasks across all processes for future work
    """
    queryset = ProcessTaskUser.objects.none()
    serializer_class = MyProcessTaskUserSerializer
    filter_backends = (filters.DjangoFilterBackend, AliasOrderingFilter)
    ordering_fields = ('user', 'title', 'task', 'task_repr', 'type', 'deadline', 'reassigned', 'reassign_date', 'finished', 'process','processtask')
    ordering_map = {
        'task': 'processtask__task__hash',
        'process': 'processtask__process__hash',
        'processtask': 'processtask_hash',
        'title': 'processtask__task__title',
        'deadline': 'processtask__deadline',
        'type': 'processtask__task__ttype',
        'task_repr': 'processtask__task__title'
    }

    def get_queryset(self):
        """
            Retrieves a list of user assigned process tasks
        """
        ptasks = ProcessTaskUser.all(finished=False).filter(
                Q(processtask__status=ProcessTask.WAITING),
                user=self.request.user,
            ).order_by('processtask__deadline') #.values_list('processtask')

        #return ProcessTask.all().filter(id__in=ptasks).order_by('deadline')
        return ptasks

class MyTask(generics.RetrieveAPIView):
    queryset = ProcessTaskUser.all()
    serializer_class = MyProcessTaskUserDetailSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    lookup_field = 'hash'

    def get_object(self):
        queryset = self.get_queryset()
        filter = {
            'hash': self.kwargs['hash']
        }

        obj = get_object_or_404(queryset, **filter)
        self.check_object_permissions(self.request, obj)
        return obj

class MyTaskDependencies(generics.ListAPIView):
    queryset = ProcessTaskUser.objects.none()
    serializer_class = ProcessTaskSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    lookup_field = 'hash'

    def get_queryset(self):
        obj = None
        try:
            obj = ProcessTaskUser.all().get(
                    processtask__hash=self.kwargs['hash'],
                    user=self.request.user
                )
        except ProcessTaskUser.DoesNotExist:
            raise Http404

        self.check_object_permissions(self.request, obj)

        task_deps = obj.processtask.task.dependencies().values_list('dependency')
        process = obj.processtask.process

        return ProcessTask.all().filter(process=process, task__in=task_deps)

#############################################################################################
###
### Request related api calls available
###
#############################################################################################

class RequestResponseSerializer(serializers.ModelSerializer):
    status_repr = serializers.SerializerMethodField()
    public = serializers.BooleanField(write_only=True)

    class Meta:
        model = RequestResponse
        exclude = ['id']
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

    def get_status_repr(self, obj):
        return dict(Request.TYPES)[obj.status]

class RequestSerializer(serializers.ModelSerializer):
    processtaskuser = ProcessTaskUserSerializer(read_only=True)
    process = serializers.CharField(max_length=50)
    process_repr = serializers.SerializerMethodField()
    process_owner = serializers.SerializerMethodField()
    task = serializers.CharField(max_length=50)
    user = serializers.IntegerField(write_only=True)
    date = serializers.SerializerMethodField()
    type_repr = serializers.SerializerMethodField()
    response = RequestResponseSerializer(required=False)

    def get_date(self, obj):
        return obj.date.strftime("%Y-%m-%d %H:%M")

    def get_type_repr(self, obj):
        return dict(Request.TYPES)[obj.type]

    def get_process_owner(self, obj):
        return obj.processtaskuser.processtask.process.executioner.id

    def get_process_repr(self, obj):
        return str(obj.processtaskuser.processtask.process)

    @transaction.atomic
    def create(self, validated_data):
        process = validated_data.pop('process')
        task    = validated_data.pop('task')
        user    = validated_data.pop('user')

        try:
            process = Process.objects.get(hash=process)
            task = Task.objects.get(hash=task)



            validated_data[u'processtaskuser'] =  ProcessTaskUser.objects.get(
                    processtask__process=process,
                    processtask__task=task,
                    user__id=user
                )
        except Process.DoesNotExist:
            return Response({'error': 'Process %s not found' %(request.data['process'])}, status=404)

        except Task.DoesNotExist:
            return Response({'error': 'Task %s not found' %(request.data['task'])}, status=404)

        except ProcessTaskUser.DoesNotExist:
            return Response({'error': 'User %f is not performing task %s' %(request.user, request.data['task'])}, status=404)


        response = validated_data.pop('response', None)

        request = Request.objects.create(**validated_data)

        rserializer = None
        if response:
            response['request'] = request.id

            make_public = response.pop('public', False)

            rserializer = RequestResponseSerializer(data=response)

            rserializer.is_valid()

            rserializer.save()

            request.public = make_public
            request.save()

        if rserializer:
            request.resolve()

        return request

    @transaction.atomic
    def update(self, instance, validated_data):
        tasks_data = None

        try:
            process = validated_data.pop('process')
            task    = validated_data.pop('task')
            user    = validated_data.pop('user')
            processtaskuser = validated_data.pop('processtaskuser')
        except KeyError:
            pass

        response = validated_data.pop('response', None)
        rserializer = None
        if response:
            rep = None
            try:
                rep = instance.response
            except RequestResponse.DoesNotExist:
                rep = RequestResponse(request=instance)
                rep.save()

            make_public = response.get('public', False)

            try:
                rserializer = RequestResponseSerializer(
                    instance=rep,
                    data=response,
                    partial=True
                )
            except RequestResponse.DoesNotExist:
                rserializer = RequestResponseSerializer(data=response)

            rserializer.is_valid(raise_exception=True)

            rserializer.save()

            instance.public = make_public

            instance.resolve()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance

    class Meta:
        model = Request
        exclude = ('id', 'removed')
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        extra_kwargs = {
            'hash': {'required': False}
        }

class SimpleRequestSerializer(RequestSerializer):
    class Meta(RequestSerializer.Meta):
        exclude = ('id', 'removed', 'processtaskuser')

class RequestFilter(django_filters.FilterSet):
    process = django_filters.CharFilter(name="processtaskuser__processtask__process__hash")
    task = django_filters.CharFilter(name="processtaskuser__processtask__task__hash")
    user = django_filters.CharFilter(name="processtaskuser__user")

    class Meta:
        model = Request
        fields = ('hash', 'type', 'title', 'message', 'date', 'resolved', 'process', 'task', 'user')


# ViewSets define the view behavior.
class RequestsViewSet(  mixins.CreateModelMixin,
                        mixins.UpdateModelMixin,
                        mixins.ListModelMixin,
                        mixins.RetrieveModelMixin,
                        mixins.DestroyModelMixin,
                        viewsets.GenericViewSet):
    """
    API for Process Requests manipulation

        Note: All methods on this class pertain to user owned processes
    """
    queryset = Request.objects.none()
    serializer_class = RequestSerializer
    lookup_field = 'hash'

    filter_backends = [filters.DjangoFilterBackend, AliasOrderingFilter]
    filter_class = RequestFilter

    ordering_fields = ('hash', 'type', 'title', 'message', 'date', 'resolved', 'process', 'task', 'user')

    ordering_map = {
        'process': 'processtaskuser__processtask__process__hash',
        'task': 'processtaskuser__processtask__task__hash',
        'user': 'processtaskuser__user',

    }

    # we must override queryset to filter by authenticated user
    def get_queryset(self):
        return Request.all(executioner=self.request.user)

    def get_object(self):
        obj = None
        try:
            obj = Request.objects.get(
                Q(public=True) |
                Q(processtaskuser__processtask__process__executioner=self.request.user) |
                Q(processtaskuser__user=self.request.user),
                hash=self.kwargs['hash']
            )
        except Request.DoesNotExist:
            pass

        if obj == None:
            raise Http404('No object')

        self.check_object_permissions(self.request, obj)
        return obj

    def list(self, request, *args, **kwargs):
        """
        Return a list of executioner-related requests

        """
        return super(RequestsViewSet, self).list(request, args, kwargs)


    def create(self, request, *args, **kwargs):
        """
        Insert a new request

        """
        request.data[u'user'] = request.user.id

        serializer, headers = create_serializer(self, request)
        process = serializer.instance.processtaskuser.processtask.process
        process_owner = process.executioner

        History.new(event=History.ADD, actor=request.user, object=serializer.instance, authorized=[process_owner], related=[process])

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """
        Update an already existing request

        """
        request.data[u'user'] = request.user.id

        instance = self.get_object()

        serializer = RequestSerializer(instance=instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        serializer = RequestSerializer(instance=instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        process = serializer.instance.processtaskuser.processtask.process
        process_owner = process.executioner

        History.new(event=History.EDIT, actor=request.user, object=instance, authorized=[process_owner], related=[process])

        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a request, by id

        """
        instance = self.get_object()

        process = instance.processtaskuser.processtask.process
        process_owner = process.executioner

        History.new(event=History.ACCESS, actor=request.user, object=instance, authorized=[process_owner], related=[process])

        return Response(RequestSerializer(instance).data)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        """
        Delete a request, by id
        """
        instance = self.get_object()

        instance.removed = True
        instance.save()

        process = instance.processtaskuser.processtask.process
        process_owner = process.executioner

        History.new(event=History.DELETE, actor=request.user, object=instance, authorized=[process_owner], related=[process])

        return Response(status=status.HTTP_204_NO_CONTENT)


### Handler for retrieving EXPORT Data from FormTasks
class ProcessTaskResultExport(APIView):
    def get(self, request, hash, mode):
        if not mode:
            mode = 'csv'

        ptask = get_object_or_404(ProcessTask, hash=hash)

        if not (
                request.user == ptask.process.executioner
                or ptask.process.workflow.workflowpermission.public
            ):
            raise Http404

        try:
            # Type is generic, so we must get it (as we have no idea of type from processtask)
            task = Task.objects.get_subclass(id=ptask.task.id)

            exporter = task.get_exporter(mode, ptask)

            export = exporter.export()

            if isinstance(export, HttpResponse) or isinstance(export, StreamingHttpResponse):
                return export

        except ResultExporter.UnsupportedExport:
            raise

        return Response({'export': export}, 500)


class ResultsPDF(PDFTemplateView):
    template_name='results_pdf.html'
    filename='results.pdf'

    def get(self, request, hash):
        from result.models import Result

        ptask = get_object_or_404(ProcessTask, hash=hash)

        if not (
                request.user == ptask.process.executioner
                or ptask.process.workflow.workflowpermission.public
            ):
            raise Http404

        users = ptask.users().values_list('id', flat=True)


        results = Result.objects.filter(removed=False, processtaskuser__in=users).select_subclasses()

        tasktype = ptask.task.subclass()
        schema=None

        if tasktype.type() == 'form.FormTask':
            schema = tasktype.form.schema

        context = {
            'STATIC_URL': settings.STATIC_URL,
            'processtask': ptask,
            'schema' : schema,
            'results': results,
            'status': ProcessTask.statusCode(ptask.status)
        }


        response_class = self.response_class

        if request.GET.get('as', '') == 'html':
            return render(request, self.template_name, context)

        return PDFTemplateResponse(request=request,
                                   template=self.template_name,
                                   filename=self.filename,
                                   context= context,
                                   show_content_in_browser=False,
                                   cmd_options= {'javascript-delay': 1000},
                                   )

