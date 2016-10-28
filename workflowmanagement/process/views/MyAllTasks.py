# coding=utf-8
from process.serializers.MyProcessTaskUserSerializer import  MyProcessTaskUserSerializer

from rest_framework import  viewsets, mixins, status, filters
from rest_framework.decorators import list_route
from rest_framework.response import Response

from process.models import *
from django.db.models import Q

from utils.api_related import AliasOrderingFilter

from django.http import Http404

from itertools import chain

class MyAllTasks(mixins.CreateModelMixin,
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
        #First get all that are waiting for anwser
        ptasksWaiting = ProcessTaskUser.all(finished=False).filter(
            Q(status=ProcessTaskUser.WAITING) & Q(processtask__status=ProcessTask.WAITING_AVAILABILITY),
            user=self.request.user,
        ).order_by('processtask__deadline')

        #Them get all that are running
        ptasksRunning = ProcessTaskUser.all(finished=False).filter(
            processtask__status=ProcessTask.RUNNING,
            user=self.request.user,
        ).order_by('processtask__deadline')

        #Finally get all that are scheduled
        ptasksFuture = ProcessTaskUser.all(finished=False).filter(
            ~Q(status=ProcessTaskUser.REJECTED) &
            Q(Q(
                Q(processtask__status=ProcessTask.WAITING_AVAILABILITY) & ~Q(status=ProcessTaskUser.WAITING)) |
                Q(processtask__status=ProcessTask.WAITING)),
            user=self.request.user,
        ).order_by('processtask__deadline')

        ptasks = list(chain(ptasksWaiting,ptasksRunning,ptasksFuture))
        return ptasks

    @list_route(methods=['post'])
    def accept(self, request):
        hashField = request.data['ptuhash']

        obj = None
        try:
            obj = ProcessTaskUser.all().get(
                hash=hashField,
                user=self.request.user
            )
            obj.accept()
        except ProcessTaskUser.DoesNotExist:
            raise Http404

        return Response(status=status.HTTP_204_NO_CONTENT)

    @list_route(methods=['post'])
    def reject(self, request):
        hashField = request.data['ptuhash']

        obj = None
        try:
            obj = ProcessTaskUser.all().get(
                hash=hashField,
                user=self.request.user
            )
            obj.reject(request.data['comment'])
        except ProcessTaskUser.DoesNotExist:
            raise Http404

        return Response(status=status.HTTP_204_NO_CONTENT)

