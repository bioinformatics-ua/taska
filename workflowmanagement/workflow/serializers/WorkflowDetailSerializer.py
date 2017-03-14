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

class WorkflowDetailSerializer(serializers.ModelSerializer):
    permissions = WorkflowPermissionSerializer()
    tasks = GenericTaskSerializer(many=True)

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