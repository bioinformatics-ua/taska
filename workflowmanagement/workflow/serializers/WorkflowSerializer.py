# coding=utf-8
import django_filters
from rest_framework import renderers, serializers, viewsets, permissions, mixins, status, filters
from rest_framework.decorators import api_view, detail_route, list_route
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework.exceptions import PermissionDenied

from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Q
from django.http import Http404

from oauth2_provider.ext.rest_framework import TokenHasReadWriteScope, TokenHasScope

from workflow.models import *
from workflow.serializers.WorkflowPermissionSerializer import WorkflowPermissionSerializer
from tasks.models import Task, TaskDependency
from tasks.api import GenericTaskSerializer

from history.models import History
from utils.api_related import create_serializer, AliasOrderingFilter

import copy

class WorkflowSerializer(serializers.ModelSerializer):
    permissions = WorkflowPermissionSerializer()
    tasks = GenericTaskSerializer(many=True, required=False)
    assoc_processes = serializers.SerializerMethodField()

    owner_repr = serializers.SerializerMethodField()

    def get_owner_repr(self, obj):
        return obj.owner.get_full_name() or obj.owner.email

    def get_assoc_processes(self, obj):
        return obj.assocProcesses().values_list('hash', flat=True)

    class Meta:
        model = Workflow
        exclude = ('id', 'removed')
        read_only_fields = ('create_date', 'latest_update')
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        extra_kwargs = {'hash': {'required': False}}

    @transaction.atomic
    def create(self, validated_data):
        permissions_data = None
        tasks_data = None

        try:
            permissions_data = validated_data.pop('permissions')
        except KeyError:
            pass

        try:
            tasks_data = validated_data.pop('tasks')
        except KeyError:
            pass

        workflow = Workflow.objects.create(**validated_data)

        # create workflow permissions
        if permissions_data:
            WorkflowPermission.objects.create(workflow=workflow, **permissions_data)

        # create tasks (if any are passed by this webservice)
        if tasks_data:
            for task_data in tasks_data:
                task_serializer = task_data.pop('serializer')
                task_data['workflow'] = workflow
                task_serializer.create(task_data)

        return workflow

    @transaction.atomic
    def update(self, instance, validated_data):
        permissions_data = None
        tasks_data = None

        try:
            permissions_data = validated_data.pop('permissions')
        except KeyError:
            pass

        try:
            tasks_data = validated_data.pop('tasks')
        except KeyError:
            pass

        if permissions_data:
            p_instance = instance.permissions()
            serializer = WorkflowPermissionSerializer(p_instance, partial=True)

            serializer.update(p_instance, permissions_data)

        if tasks_data:
            for task_data in tasks_data:
                task_serializer = task_data.pop('serializer')
                task_data['workflow'] = instance

                try:
                    t_instance = Task.objects.get_subclass(hash=task_data['hash'])

                    task_serializer.update(t_instance, task_data)

                except (Task.DoesNotExist, KeyError):
                    task_serializer.create(task_data)


        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance