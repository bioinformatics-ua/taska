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
        Insert/Update a new workflow

        """
        return super(WorkflowViewSet, self).create(request, args, kwargs)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a workflow, by id including related tasks

        """

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

        return Response(status=status.HTTP_204_NO_CONTENT)
