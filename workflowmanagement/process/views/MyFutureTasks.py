# coding=utf-8

from process.models import *
from process.serializers.MyProcessTaskUserSerializer import  MyProcessTaskUserSerializer

from rest_framework import filters, generics

from utils.api_related import AliasOrderingFilter

class MyFutureTasks(generics.ListAPIView):
    """
        Returns a list of user attributed process tasks across all processes for future work
    """
    queryset = ProcessTaskUser.objects.none()
    serializer_class = MyProcessTaskUserSerializer
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
        ptasks = ProcessTaskUser.all(finished=False, reassigned=False).filter(
                ~Q(status=ProcessTaskUser.REJECTED) &
                Q(Q(Q(processtask__status=ProcessTask.WAITING_AVAILABILITY) & ~Q(status=ProcessTaskUser.WAITING)) |
                  Q(processtask__status=ProcessTask.WAITING)),
                user=self.request.user,
            ).order_by('processtask__deadline')

        return ptasks
