# coding=utf-8
import django_filters
from rest_framework import renderers, serializers, viewsets, permissions, mixins, status
from rest_framework.decorators import api_view, detail_route, list_route
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework import status, filters

from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated

from django.contrib.auth.models import User
from oauth2_provider.ext.rest_framework import TokenHasReadWriteScope, TokenHasScope

from tasks.models import *

from workflow.models import Workflow

from django.apps import apps
from django.db import transaction

from history.models import History

from utils.api_related import create_serializer, AliasOrderingFilter

from material.api import GenericResourceSerializer

#@api_view(('GET',))
#def root(request, format=None):
#    return Response({
#        #'User Listing   ': reverse('user-list', request=request, format=format),
#    })
class TaskDepSerializer(serializers.ModelSerializer):
    dependency = serializers.SlugRelatedField(slug_field='hash', queryset=Task.objects)

    class Meta:
        model = TaskDependency
        exclude = ('id', 'maintask')
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

class GenericTaskSerializer(serializers.ModelSerializer):
    type = serializers.CharField(write_only=True)

    def to_representation(self, obj):
        return obj.to_representation(obj)

    def create(self, data):
        serializer = data.pop('serializer')

        return serializer.create(data)

    def update(self, instance, data):
        serializer = data.pop('serializer')

        return serializer.update(instance, data)

    def to_internal_value(self, data):
        if data.get('type', False):
            this_model = apps.get_model(data.pop('type'))

            serializer = this_model.init_serializer(partial=True)
            validated = serializer.to_internal_value(data)
            validated['serializer'] = serializer

            return validated

        raise Exception('Found invalid task type to be processed.')

    # override to suport
    #def to_internal_value(self, data):
    #    return obj.to_internal_value(obj)

    #def create(self, validated_data):
    #    return HighScore.objects.create(**validated_data)
    class Meta:
        model = Task


# Serializers define the API representation.
class TaskSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    dependencies = TaskDepSerializer(many=True, required=False)
    resources = serializers.SerializerMethodField()
    resourceswrite = serializers.ListField(child=serializers.CharField(), write_only=True)


    def get_resources(self, obj):
        serializer = GenericResourceSerializer(
                obj.resources.all().select_subclasses(),
                many=True
            )

        return serializer.data

    def get_type(self, obj):
        return obj.type()

    def __create_tasks(self, task, dependencies):
        if dependencies != None:
            for dep in dependencies:
                TaskDependency.objects.create(maintask=task, **dep)

    def __create_resources(self, task, resources):
        if resources != None:
            old_resources = task.resources.exclude(hash__in=resources).select_subclasses()

            for old in old_resources:
                # mark the resource as removed
                #old.remove()
                task.resources.remove(old)


            for resource in resources:
                try:
                    r = Resource.objects.get(hash=resource)
                    r.link()
                    task.resources.add(r)
                    task.save()
                except Resource.DoesNotExist:
                    print "-- ERROR: Couldnt add resource to task"

    @transaction.atomic
    def create (self, data):
        dependencies = data.pop('dependencies', None)
        resources = data.pop('resourceswrite', None)

        # this is generically, some custom tasks can override this behaviour
        task =  self.Meta.model.objects.create(**data)

        self.__create_tasks(task, dependencies)

        self.__create_resources(task, resources)

        return task

    @transaction.atomic
    def update(self, instance, data):
        dependencies = data.pop('dependencies', None)
        resources = data.pop('resourceswrite', None)

        for attr, value in data.items():
            setattr(instance, attr, value)

        instance.save()

        # Since they are nested, we wont now if we should remove a entry or not
        # so we presume when somebody passes the deps nested array this will
        # replace the old ones
        TaskDependency.objects.filter(maintask=instance).delete()

        self.__create_tasks(instance, dependencies)
        self.__create_resources(instance, resources)

        return instance



    class Meta:
        model = Task
        write_only_fields = ('workflow',)
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        exclude = ('id', 'removed', 'ttype')
        extra_kwargs = {
            'hash': {'required': False},
            'description': {'required': False},
            'resources': {'read_only': True}
        }

class SimpleTaskSerializer(TaskSerializer):
    class Meta(TaskSerializer.Meta):
        model = SimpleTask
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

class TaskFilter(django_filters.FilterSet):
    type = django_filters.CharFilter(name="ttype")
    class Meta:
        model = Task
        fields = ['workflow', 'hash', 'sortid', 'title', 'description',"type"]


# ViewSets define the view behavior.
class TaskViewSet(  mixins.CreateModelMixin,
                    mixins.UpdateModelMixin,
                    mixins.ListModelMixin,
                    mixins.RetrieveModelMixin,
                    viewsets.GenericViewSet):
    """
    API for Task manipulation

    """
    queryset = Task.objects.none()
    serializer_class = GenericTaskSerializer
    lookup_field = 'hash'

    filter_backends = [filters.DjangoFilterBackend, AliasOrderingFilter]
    filter_class = TaskFilter

    ordering_fields = ['workflow', 'hash', 'sortid', 'title', 'description', 'type']
    ordering_map = {
        'type': 'ttype'
    }

    # we must override queryset to filter by authenticated user
    def get_queryset(self):
        return Task.all(owner=self.request.user)

    def list(self, request, *args, **kwargs):
        """
        Return a list of user-attributed tasks

        """
        return super(TaskViewSet, self).list(request, args, kwargs)

    def create(self, request, *args, **kwargs):
        """
        Add a result as a response to a task

        """
        serializer, headers = create_serializer(self, request)

        History.new(event=History.ADD, actor=request.user, object=serializer.instance)

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """
        Update a task

        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        serializer = instance.init_serializer(instance=instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        History.new(event=History.EDIT, actor=request.user, object=instance)

        return Response(serializer.data)
        #return super(TaskViewSet, self).partial_update(request, args, kwargs)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a task details, by id
        """
        History.new(event=History.ACCESS, actor=request.user, object=self.get_object())

        return super(TaskViewSet, self).retrieve(request, args, kwargs)

    @detail_route(methods=['post'])
    def requests(self, request):
        """
        Make a request related to a task, by id.
        Request can be of several types, such as Clarification, or reassignment

        TODO: Implement
        """
        return Response({})

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        """
        Delete a task, by id

        """
        instance = self.get_object()

        instance.removed = True
        instance.save()

        History.new(event=History.DELETE, actor=request.user, object=instance)

        return Response(status=status.HTTP_204_NO_CONTENT)


############################################################
##### Gets possible dependencies for a Task - Private Web service only for administrators
############################################################

class TaskDependenciesView(APIView):
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kw):
        if request.user.is_authenticated() and request.user.is_staff:
            try:
                task = request.POST.get('task', None)
                if task != None:
                    task = Task.objects.get(id=task)
                workflow = Workflow.objects.get(id=request.POST.get('workflow'))
            except:
                raise

            deps = Task.getPossibleDependencies(workflow, task=task)
            jsondeps = []

            for dep in deps:
                jsondeps.append({'id': dep.id, 'title': dep.title})

            response = Response({'dependencies': jsondeps}, status=status.HTTP_200_OK)

        else:
            response = Response({}, status=status.HTTP_403_FORBIDDEN)
        return response
