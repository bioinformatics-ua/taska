# coding=utf-8
from rest_framework import renderers, serializers, viewsets, permissions, mixins
from rest_framework.decorators import api_view, detail_route, list_route, action
from rest_framework.response import Response
from rest_framework.reverse import reverse

from django.contrib.auth.models import User
from oauth2_provider.ext.rest_framework import TokenHasReadWriteScope, TokenHasScope

from tasks.models import *

@api_view(('GET',))
def root(request, format=None):
    return Response({
        #'User Listing   ': reverse('user-list', request=request, format=format),
    })

# Serializers define the API representation.
class TaskSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Task
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

# ViewSets define the view behavior.
class TaskViewSet(  mixins.CreateModelMixin,
                    mixins.ListModelMixin,
                    mixins.RetrieveModelMixin,
                    viewsets.GenericViewSet):
    """
    API for Task manipulation

    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    def list(self, request, *args, **kwargs):
        """
        Return a list of user-attributed tasks

        TODO: Implement

        """
        return Response({})

    def create(self, request, *args, **kwargs):
        """
        Add a result as a response to a task

        TODO: Implement

        """
        return Response({})

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
