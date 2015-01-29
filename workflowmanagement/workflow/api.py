# coding=utf-8
from rest_framework import renderers, serializers, viewsets, permissions, mixins
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework import status
from rest_framework.decorators import detail_route, list_route

from django.contrib.auth.models import User
from django.db import transaction
from oauth2_provider.ext.rest_framework import TokenHasReadWriteScope, TokenHasScope

from .models import *
from tasks.models import Task, TaskDependency
from tasks.api import GenericTaskSerializer

from history.models import History
from utils.api_related import create_serializer

@api_view(('GET',))
def root(request, format=None):
    return Response({
        #'User Listing   ': reverse('user-list', request=request, format=format),
    })

class WorkflowPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowPermission
        exclude = ('id', 'workflow')
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

# Serializers define the API representation.
class WorkflowSerializer(serializers.ModelSerializer):
    permissions = WorkflowPermissionSerializer()
    tasks = GenericTaskSerializer(many=True, write_only=True)

    class Meta:
        model = Workflow
        exclude = ('id', 'removed')
        read_only_fields = ('create_date', 'latest_update')
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

    @transaction.atomic
    def update(self, instance, data):
        tasks = []
        try:
            tasks = data.pop('tasks')
            print "-- ERROR: Ignoring tasks, they have to be inserted through task web-services not workflow"
        except KeyError:
            pass

        for attr, value in data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance

class WorkflowDetailSerializer(serializers.ModelSerializer):
    permissions = WorkflowPermissionSerializer()
    tasks =     GenericTaskSerializer(many=True)

    class Meta:
        model = Workflow
        exclude = ('id', 'removed')
        read_only_fields = ('create_date', 'latest_update')
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

# ViewSets define the view behavior.
class WorkflowViewSet(  mixins.CreateModelMixin,
                        mixins.UpdateModelMixin,
                        mixins.ListModelMixin,
                        mixins.RetrieveModelMixin,
                        mixins.DestroyModelMixin,
                        viewsets.GenericViewSet):
    """
    API for Workflow manipulation

        Note: All methods on this class pertain to user owned workflows
    """
    queryset = Workflow.objects.none()
    serializer_class = WorkflowSerializer
    lookup_field = 'hash'

    # we must override queryset to filter by authenticated user
    def get_queryset(self):
        return Workflow.all(user=self.request.user)

    def list(self, request, *args, **kwargs):
        """
        Return a list of user-owned workflows

        """
        return super(WorkflowViewSet, self).list(request, args, kwargs)


    def create(self, request, *args, **kwargs):
        """
        Insert a new workflow

        """
        serializer, headers = create_serializer(self, request)

        History.new(event=History.ADD, actor=request.user, object=serializer.instance)

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """
        Update a existing workflow

        """
        instance = self.get_object()

        serializer = WorkflowSerializer(instance=instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        History.new(event=History.EDIT, actor=request.user, object=instance)

        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a workflow, by id including related tasks

        """
        History.new(event=History.ACCESS, actor=request.user, object=self.get_object())

        return Response(WorkflowDetailSerializer(self.get_object()).data)
        #return super(WorkflowViewSet, self).retrieve(request, args, kwargs)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        """
        Delete a workflow, by id

        """
        instance = self.get_object()

        instance.removed = True
        instance.save()

        History.new(event=History.DELETE, actor=request.user, object=instance)

        return Response(status=status.HTTP_204_NO_CONTENT)
