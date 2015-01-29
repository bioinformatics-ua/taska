# coding=utf-8
from rest_framework import renderers, serializers, viewsets, permissions, mixins
from rest_framework.decorators import api_view, detail_route, list_route
from rest_framework.response import Response
from rest_framework.reverse import reverse

from django.contrib.auth.models import User
from oauth2_provider.ext.rest_framework import TokenHasReadWriteScope, TokenHasScope

from process.models import Process, ProcessTask

from history.models import History

from utils.api_related import create_serializer

@api_view(('GET',))
def root(request, format=None):
    return Response({
        #'User Listing   ': reverse('user-list', request=request, format=format),
    })

class ProcessTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessTask
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        exclude = ('removed',)

# Serializers define the API representation.
class ProcessSerializer(serializers.ModelSerializer):
    tasks = ProcessTaskSerializer(many=True, write_only=True)

    class Meta:
        model = Process
        exclude = ('id', 'removed')
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

class DetailProcessSerializer(serializers.ModelSerializer):
    tasks = ProcessTaskSerializer(many=True)

    class Meta:
        model = Process
        exclude = ('id', 'removed')
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

# ViewSets define the view behavior.
class ProcessViewSet(  mixins.CreateModelMixin,
                        mixins.ListModelMixin,
                        mixins.RetrieveModelMixin,
                        mixins.DestroyModelMixin,
                        viewsets.GenericViewSet):
    """
    API for Process manipulation

        Note: All methods on this class pertain to user owned processes
    """
    queryset = Process.all()
    serializer_class = ProcessSerializer
    lookup_field = 'hash'

    def list(self, request, *args, **kwargs):
        """
        Return a list of user-owned processes

        """
        return super(ProcessViewSet, self).list(request, args, kwargs)


    def create(self, request, *args, **kwargs):
        """
        Insert/Update a new process

        """
        serializer, headers = create_serializer(self, request)

        History.new(event=History.ADD, actor=request.user, object=serializer.instance)

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a process, by id

        """
        instance = self.get_object()
        History.new(event=History.ACCESS, actor=request.user, object=instance)

        return Response(DetailProcessSerializer(instance)).data

    def destroy(self, request, *args, **kwargs):
        """
        Delete a process, by id

        TODO: Implement
        """
        return Response({})

    @list_route(methods=['get'])
    def requests(self, request):
        """
        Show user-attributed requests, related with owned processes
        Request can be of several types, such as Clarification, or reassignment

        TODO: Implement
        """
        return Response({})
