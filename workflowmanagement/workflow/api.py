# coding=utf-8
from rest_framework import renderers, serializers, viewsets, permissions, mixins
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse

from django.contrib.auth.models import User
from oauth2_provider.ext.rest_framework import TokenHasReadWriteScope, TokenHasScope

from workflow.models import Workflow

@api_view(('GET',))
def root(request, format=None):
    return Response({
        #'User Listing   ': reverse('user-list', request=request, format=format),
    })

# Serializers define the API representation.
class WorkflowSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Workflow
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
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer
    def list(self, request, *args, **kwargs):
        """
        Return a list of user-owned workflows

        TODO: Implement

        """
        return Response({})

    def create(self, request, *args, **kwargs):
        """
        Insert/Update a new workflow

        TODO: Implement

        """
        return Response({})

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a workflow, by id

        TODO: Implement
        """
        return Response({})

    def destroy(self, request, *args, **kwargs):
        """
        Delete a workflow, by id

        TODO: Implement
        """
        return Response({})
