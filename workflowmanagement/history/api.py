# coding=utf-8
from rest_framework import renderers, serializers, viewsets, permissions, mixins
from rest_framework.decorators import api_view, detail_route, list_route, action
from rest_framework.response import Response
from rest_framework.reverse import reverse

from django.contrib.auth.models import User
from oauth2_provider.ext.rest_framework import TokenHasReadWriteScope, TokenHasScope

from history.models import *

@api_view(('GET',))
def root(request, format=None):
    return Response({
        #'User Listing   ': reverse('user-list', request=request, format=format),
    })

# Serializers define the API representation.
class HistorySerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = History
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

# ViewSets define the view behavior.
class HistoryViewSet(   mixins.ListModelMixin,
                        mixins.RetrieveModelMixin,
                        viewsets.GenericViewSet):
    """
    API for History manipulation

    """
    queryset = History.objects.all()
    serializer_class = HistorySerializer
    def list(self, request, *args, **kwargs):
        """
        Return a list of history over all processes

        TODO: Implement

        """
        return Response({})

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a list of history, for a given process, by id

        TODO: Implement
        """
        return Response({})
