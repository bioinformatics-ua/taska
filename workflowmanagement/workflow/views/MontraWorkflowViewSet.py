# coding=utf-8
from rest_framework import filters, generics
from utils.api_related import AliasOrderingFilter

from workflow.models import *
from workflow.serializers.WorkflowSerializer import WorkflowSerializer
from workflow.filters.WorkflowFilter import WorkflowFilter

class MontraWorkflowViewSet(generics.ListAPIView):
    """
        API for Workflow manipulation

            Note: All methods on this class pertain to user owned workflows
        """
    queryset = Workflow.objects.none()
    serializer_class = WorkflowSerializer
    lookup_field = 'hash'

    filter_backends = [filters.DjangoFilterBackend, AliasOrderingFilter]
    filter_class = WorkflowFilter

    ordering_fields = ['owner', 'hash', 'title', 'create_date', 'latest_update', 'public', 'searchable', 'forkable']
    ordering_map = {
        'public': 'workflowpermission__public',
        'searchable': 'workflowpermission__searchable',
        'forkable': 'workflowpermission__forkable',
        'owner_repr': 'owner__id'
    }

    # we must override queryset to filter by authenticated user
    def get_queryset(self):
        return Workflow.all().filter(
            Q(workflowpermission__visibility=WorkflowPermission.MONTRA))