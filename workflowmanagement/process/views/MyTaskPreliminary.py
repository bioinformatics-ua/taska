# coding=utf-8

from process.models import *
from process.serializers.MyProcessTaskUserDetailSerializer import  MyProcessTaskUserDetailSerializer

from rest_framework import filters, generics
from django.shortcuts import get_object_or_404

class MyTaskPreliminary(generics.RetrieveAPIView):
    queryset = ProcessTaskUser.all()
    serializer_class = MyProcessTaskUserDetailSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    lookup_field = 'hash'

    def get_object(self):
        queryset = self.get_queryset()
        filter = {
            'hash': self.kwargs['hash']
        }

        obj = get_object_or_404(queryset, **filter)
        self.check_object_permissions(self.request, obj)


        ptasks = self.preliminary_outputs(obj)

        for pt in ptasks:
            pt.move(force=True)

        return obj

    @transaction.atomic
    def preliminary_outputs(self, ptaskuser):
        """
            Generates preliminary outputs from form tasks without the tasks being completed
        """
        ptask = ptaskuser.processtask
        process = ptask.process


        task_deps = ptask.task.dependencies().filter(dependency__output_resources=True).values_list('dependency')

        ptasks = ProcessTask.all().filter(process=process, task__in=task_deps)

        return ptasks
