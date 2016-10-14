# coding=utf-8

from process.models import *
from rest_framework import serializers
from ProcessTaskUserSerializer import  ProcessTaskUserSerializer
from MyProcessTaskSerializer import  MyProcessTaskSerializer
from RequestSerializer import  SimpleRequestSerializer
from ProcessTaskSerializer import  ProcessTaskSerializer

class MyProcessTaskUserDetailSerializer(ProcessTaskUserSerializer):
    processtask = MyProcessTaskSerializer()
    requests = serializers.SerializerMethodField()
    task_repr = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    start_date = serializers.SerializerMethodField()
    deadline = serializers.SerializerMethodField()
    dependencies = serializers.SerializerMethodField()

    def get_task_repr(self, obj):
        return obj.processtask.task.title

    def get_type(self, obj):
        return Task.objects.get_subclass(id=obj.processtask.task.id).type()

    def get_start_date(self, obj):
        return obj.processtask.calculateStart()

    def get_deadline(self, obj):
        return obj.processtask.deadline

    def get_requests(self, obj):
        return SimpleRequestSerializer(obj.requests() ,many=True).data

    def get_dependencies(self, obj):
        task_deps = obj.processtask.task.dependencies().filter(dependency__output_resources=True).values_list('dependency')
        process = obj.processtask.process

        return ProcessTaskSerializer(ProcessTask.all().filter(process=process, task__in=task_deps), many=True).data
