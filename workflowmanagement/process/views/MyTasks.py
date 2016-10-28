# coding=utf-8

from process.models import *
from process.serializers.MyProcessTaskUserSerializer import  MyProcessTaskUserSerializer


from rest_framework.decorators import detail_route
from rest_framework import filters, generics
from rest_framework.response import Response

from utils.api_related import AliasOrderingFilter


from django.http import Http404

class MyTasks(generics.ListAPIView):
    """
        Returns a list of user attributed process tasks across all processes
    """
    queryset = ProcessTaskUser.objects.none()
    serializer_class = MyProcessTaskUserSerializer
    filter_backends = (filters.DjangoFilterBackend, AliasOrderingFilter)
    ordering_fields = ('user', 'title', 'task', 'task_repr', 'process_repr', 'type', 'deadline', 'reassigned', 'reassign_date', 'finished', 'process','processtask')
    ordering_map = {
        'task': 'processtask__task__hash',
        'process': 'processtask__process__hash',
        'processtask': 'processtask_hash',
        'title': 'processtask__task__title',
        'deadline': 'processtask__deadline',
        'type': 'processtask__task__ttype',
        'task_repr': 'processtask__task__title',
        'process_repr': 'processtask__process'
    }

    def get_queryset(self):
        """
            Retrieves a list of user assigned process tasks
        """
        ptasks = ProcessTaskUser.all(finished=False).filter(
            Q(processtask__status=ProcessTask.RUNNING),
            user=self.request.user,
        ).order_by('processtask__deadline')  # .values_list('processtask')

        # return ProcessTask.all().filter(id__in=ptasks).order_by('deadline')

        return ptasks


    @detail_route(methods=['get'])
    def getTaskName(self, request, hash=None):
        try:
            obj = Task.all().filter(
                hash=hash
            )
            return Response({"TaskName": obj[0].title})
        except ProcessTaskUser.DoesNotExist:
            raise Http404

        return Response({"TaskName": "Not Found"})