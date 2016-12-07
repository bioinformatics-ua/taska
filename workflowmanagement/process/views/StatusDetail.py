# coding=utf-8

from process.models import *
from process.serializers.MyProcessTaskUserSerializer import  MyProcessTaskUserSerializer

from rest_framework.decorators import detail_route
from rest_framework import viewsets, mixins, status, filters
from rest_framework.response import Response

from utils.api_related import create_serializer, AliasOrderingFilter

from django.shortcuts import get_object_or_404
from django.http import Http404

class StatusDetail(mixins.CreateModelMixin,
                     mixins.UpdateModelMixin,
                     mixins.ListModelMixin,
                     mixins.RetrieveModelMixin,
                     mixins.DestroyModelMixin,
                     viewsets.GenericViewSet):
    """
        Returns a list of user attributed process tasks across all processes for future work
    """
    queryset = ProcessTaskUser.objects.none()
    serializer_class = MyProcessTaskUserSerializer
    lookup_field = 'hash'
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

        ptasks = ProcessTaskUser.all().filter(processtask__process__hash=self.kwargs['phash'])\
            .order_by('processtask__deadline')

        return ptasks

    @detail_route(methods=['post'])
    def reassignRejectedUser(self, request, phash=None, hash=None):
        '''
        Receive the hash of the task because the resign is done in the taskSimple, but we want resign in all
        process, so the service is implemented in this class
         '''
        ptask_hash = request.data.get('hash', None)

        if request.data.get('allTasks', None) == True:
            try:
                obj = Process.all().filter(
                    hash=hash
                )
                obj[0].resignRejectedUser(request.data.get('oldUser', None), request.data.get('newUser', None))
            except ProcessTaskUser.DoesNotExist:
                raise Http404
        else:
            try:
                obj = ProcessTask.all().filter(
                    hash=ptask_hash
                )
                print obj
                obj[0].resignRejectedUser(request.data.get('oldUser', None), request.data.get('newUser', None))
            except ProcessTaskUser.DoesNotExist:
                raise Http404
        return Response(status=status.HTTP_204_NO_CONTENT)
