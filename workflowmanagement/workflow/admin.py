from django.contrib import admin

from .models import *


@admin.register(Workflow)
class WorkflowAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'hash','create_date', 'latest_update')
    readonly_fields = ('hash','create_date', 'latest_update')
    exclude = ('hash',)

@admin.register(WorkflowPermission)
class WorkflowPermissionAdmin(admin.ModelAdmin):
    list_display = ('workflow', 'public', 'searchable', 'forkable')
