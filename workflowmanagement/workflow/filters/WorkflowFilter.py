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
from tasks.models import Task, TaskDependency
from tasks.api import GenericTaskSerializer

from history.models import History
from utils.api_related import create_serializer, AliasOrderingFilter

import copy

class WorkflowFilter(django_filters.FilterSet):
    public = django_filters.BooleanFilter(name="workflowpermission__public")
    searchable = django_filters.BooleanFilter(name="workflowpermission__searchable")
    forkable = django_filters.BooleanFilter(name="workflowpermission__forkable")
    class Meta:
        model = Workflow
        fields = ['owner', 'hash', 'title', 'create_date', 'latest_update', 'public', 'searchable', 'forkable']