# coding=utf-8

from process.models import *
from rest_framework import serializers
from ProcessTaskUserSerializer import  ProcessTaskUserSerializer
from MyProcessTaskSerializer import  MyProcessTaskSerializer


class MyProcessTaskUserSerializer(ProcessTaskUserSerializer):
    processtask = MyProcessTaskSerializer()
    task_repr = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    deadline = serializers.SerializerMethodField()
    result = serializers.SerializerMethodField()
    process_repr = serializers.SerializerMethodField()

    start_date = serializers.SerializerMethodField()

    def get_start_date(self, obj):
        return obj.processtask.calculateStart()

    def get_process_repr(self, obj):
        '''
            Returns a textual representation for the process this process task is included in
        '''
        return obj.processtask.process.__unicode__()

    def get_task_repr(self, obj):
        return obj.processtask.task.title

    def get_type(self, obj):
        return Task.objects.get_subclass(id=obj.processtask.task.id).type()

    def get_deadline(self, obj):
        return obj.processtask.deadline

    def get_result(self, obj):
        try:
            return obj.result.hash
        except:
            return None
