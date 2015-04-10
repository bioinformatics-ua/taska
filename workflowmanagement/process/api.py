# coding=utf-8
import django_filters

from rest_framework import renderers, serializers, viewsets, permissions, mixins
from rest_framework.decorators import api_view, detail_route, list_route
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework import status, filters, generics


from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated

from django.contrib.auth.models import User
from django.db import transaction
from oauth2_provider.ext.rest_framework import TokenHasReadWriteScope, TokenHasScope

from process.models import *
from history.models import History
from django.db.models import Q

from workflow.models import Workflow
from tasks.models import Task

from tasks.api import GenericTaskSerializer

from utils.api_related import create_serializer, AliasOrderingFilter

from result.api import GenericResultSerializer
from django.http import Http404

import json

from django.shortcuts import get_object_or_404

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
    user_repr = serializers.SerializerMethodField()
    result = serializers.SerializerMethodField()

    class Meta:
        model = ProcessTaskUser
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        exclude = ('id', 'processtask')

    def get_user_repr(self, obj):
        return obj.user.get_full_name()

    def get_result(self, obj):
        result = obj.result()

        if result:
            return GenericResultSerializer(obj.result()).data

        return None

class ProcessTaskSerializer(serializers.ModelSerializer):
    task = serializers.SlugRelatedField(slug_field='hash', queryset=Task.objects)
    task_repr = serializers.SerializerMethodField()

    users = ProcessTaskUserSerializer(many=True, required=False)
    deadline_repr = serializers.SerializerMethodField()

    class Meta:
        model = ProcessTask
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        exclude = ('process', 'removed')
        extra_kwargs = {'hash': {'required': False}}

    def get_deadline_repr(self, obj):
        return obj.deadline.strftime("%Y-%m-%dT%H:%M")

    def get_task_repr(self, obj):
        return obj.task.title

    @transaction.atomic
    def create(self, validated_data):
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

                serializer.create(user_data)

        return processtask

    @transaction.atomic
    def update(self, instance, validated_data):
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
                    user_serializer.create(user_data)


        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance

# Serializers define the API representation.
class ProcessSerializer(serializers.ModelSerializer):
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
        return obj.progress()

    def get_start_date(self, obj):
        return obj.start_date.strftime("%Y-%m-%d %H:%M")

    def get_object_repr(self, obj):
        return str(obj.workflow)

    def get_status_repr(self, obj):
        return Process.statusCode(obj.status)

    @transaction.atomic
    def create(self, validated_data):
        tasks_data = None

        try:
            tasks_data = validated_data.pop('tasks')
        except KeyError:
            pass

        process = Process.objects.create(**validated_data)

        for task in tasks_data:
            print task

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
    tasks = ProcessTaskSerializer(many=True)
    workflow = serializers.SlugRelatedField(slug_field='hash', queryset=Workflow.objects)

    class Meta:
        model = Process
        exclude = ('id', 'removed')
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

class ProcessFilter(django_filters.FilterSet):
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
        Delete a process, by id
        """
        instance = self.get_object()

        instance.removed = True
        instance.save()

        instance.cancel()

        History.new(event=History.DELETE, actor=request.user, object=instance)

        return Response(status=status.HTTP_204_NO_CONTENT)

    @detail_route(methods=['get'])
    def cancel(self, request, hash=None):
        process = self.get_object()
        process.cancel()

        return Response(ProcessSerializer(process).data)

    @detail_route(methods=['post'])
    def adduser(self, request, hash=None):
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

                return Response(ProcessSerializer(process).data)

        return Response(status=status.HTTP_400_BAD_REQUEST)

    @detail_route(methods=['post'])
    def canceluser(self, request, hash=None):
        try:
            ptask = ProcessTaskUser.objects\
                    .get(processtask__hash=request.data['ptask'],
                         user__id=request.data['user']
                    )
            print request.data['val']
            if request.data['val'] == True:
                ptask.reassign()
            else:
                ptask.assign()

        except ProcessTaskUser.DoesNotExist, KeyError:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        return Response(ProcessSerializer(self.get_object()).data)

class MyProcessTaskSerializer(serializers.ModelSerializer):
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
        return str(obj.process.hash)

    def get_process_repr(self, obj):
        return str(obj.process)

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

    def get_task_repr(self, obj):
        return obj.processtask.task.title

    def get_type(self, obj):
        return Task.objects.get_subclass(id=obj.processtask.task.id).type()

    def get_deadline(self, obj):
        return obj.processtask.deadline
    def get_requests(self, obj):
        rq = RequestSerializer(obj.requests() ,many=True).data

        return RequestSerializer(obj.requests() ,many=True).data

class MyTasks(generics.ListAPIView):
    queryset = ProcessTaskUser.objects.none()
    serializer_class = MyProcessTaskUserSerializer
    filter_backends = (filters.DjangoFilterBackend,)

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

class MyTask(generics.RetrieveAPIView):
    queryset = ProcessTaskUser.all()
    serializer_class = MyProcessTaskUserDetailSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    lookup_field = 'hash'

    def get_object(self):
        queryset = self.get_queryset()
        filter = {
            'processtask__hash': self.kwargs['hash'],
            'user': self.request.user
        }

        obj = get_object_or_404(queryset, **filter)
        self.check_object_permissions(self.request, obj)
        return obj

#############################################################################################
###
### Request related api calls available
###
#############################################################################################

class RequestResponseSerializer(serializers.ModelSerializer):
    status_repr = serializers.SerializerMethodField()

    def get_status_repr(self, obj):
        return dict(Request.TYPES)[obj.status]

    class Meta:
        model = RequestResponse
        exclude = ['id']
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

class RequestSerializer(serializers.ModelSerializer):
    processtaskuser = ProcessTaskUserSerializer(read_only=True)
    process = serializers.CharField(max_length=50)
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

            rserializer = RequestResponseSerializer(data=response)

            rserializer.is_valid()

            rserializer.save()

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
            print instance.id
            response['request'] = instance.id
            try:
                rserializer = RequestResponseSerializer(
                    instance=instance.response,
                    data=response,
                    partial=True
                )
            except RequestResponse.DoesNotExist:
                rserializer = RequestResponseSerializer(data=response)

            rserializer.is_valid()

            rserializer.save()

            instance.resolve()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance

    class Meta:
        model = Request
        exclude = ('id', 'removed')
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]


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

        process_owner = serializer.instance.processtaskuser.processtask.process.executioner

        History.new(event=History.ADD, actor=request.user, object=serializer.instance, authorized=[process_owner])

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

        History.new(event=History.EDIT, actor=request.user, object=instance)

        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a request, by id

        """
        instance = self.get_object()
        History.new(event=History.ACCESS, actor=request.user, object=instance)

        return Response(RequestSerializer(instance).data)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        """
        Delete a request, by id
        """
        instance = self.get_object()

        instance.removed = True
        instance.save()

        History.new(event=History.DELETE, actor=request.user, object=instance)

        return Response(status=status.HTTP_204_NO_CONTENT)
