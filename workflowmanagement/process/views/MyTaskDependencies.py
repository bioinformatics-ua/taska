# coding=utf-8

from process.models import *
from process.serializers.ProcessTaskSerializer import  ProcessTaskSerializer

from rest_framework import filters, generics


from django.http import Http404


class MyTaskDependencies(generics.ListAPIView):
    queryset = ProcessTaskUser.objects.none()
    serializer_class = ProcessTaskSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    lookup_field = 'hash'

    def get_queryset(self):
        obj = None
        try:
            obj = ProcessTaskUser.all().get(
                    processtask__hash=self.kwargs['hash'],
                    user=self.request.user
                )
        except ProcessTaskUser.DoesNotExist:
            raise Http404

        self.check_object_permissions(self.request, obj)

        task_deps = obj.processtask.task.dependencies().values_list('dependency')
        process = obj.processtask.process

        return ProcessTask.all().filter(process=process, task__in=task_deps)