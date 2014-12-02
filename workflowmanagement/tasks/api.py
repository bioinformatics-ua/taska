# coding=utf-8
from rest_framework import renderers, serializers, viewsets, permissions, mixins, status
from rest_framework.decorators import api_view, detail_route, list_route
from rest_framework.response import Response
from rest_framework.reverse import reverse

from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated

from django.contrib.auth.models import User
from oauth2_provider.ext.rest_framework import TokenHasReadWriteScope, TokenHasScope

from tasks.models import *

from workflow.models import Workflow

from django.apps import apps

#@api_view(('GET',))
#def root(request, format=None):
#    return Response({
#        #'User Listing   ': reverse('user-list', request=request, format=format),
#    })
class TaskDepSerializer(serializers.ModelSerializer):
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

    def update(self, instance, validated_attrs):
        pass
    def to_internal_value(self, data):
        if(data['type'] != None):
            this_model = apps.get_model(data.pop('type'))

            serializer = this_model.init_serializer()
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
    dependencies = TaskDepSerializer(many=True)

    def get_type(self, obj):
        return obj.type()
    def create (self, data):
        dependencies = data.pop('dependencies')
        # this is generically, some custom tasks can override this behaviour
        task =  self.Meta.model.objects.create(**data)

        for dep in dependencies:
            TaskDependency.objects.create(maintask=task, **dep)

        return task

    class Meta:
        model = Task
        exclude = ('workflow',)
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

class SimpleTaskSerializer(TaskSerializer):
    class Meta:
        model = SimpleTask
        #exclude = ('workflow',)
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

# ViewSets define the view behavior.
class TaskViewSet(  mixins.CreateModelMixin,
                    mixins.ListModelMixin,
                    mixins.RetrieveModelMixin,
                    viewsets.GenericViewSet):
    """
    API for Task manipulation

    """
    queryset = Task.objects.none()
    serializer_class = GenericTaskSerializer
    # we must override queryset to filter by authenticated user
    def get_queryset(self):
        return Task.objects.all().select_subclasses()

    def list(self, request, *args, **kwargs):
        """
        Return a list of user-attributed tasks

        """
        return super(TaskViewSet, self).list(request, args, kwargs)

    def create(self, request, *args, **kwargs):
        """
        Add a result as a response to a task

        TODO: Implement

        """
        return super(TaskViewSet, self).create(request, args, kwargs)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a task details, by id

        TODO: Implement
        """
        return Response({})

    @detail_route(methods=['post'])
    def requests(self, request):
        """
        Make a request related to a task, by id.
        Request can be of several types, such as Clarification, or reassignment

        TODO: Implement
        """
        return Response({})

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
