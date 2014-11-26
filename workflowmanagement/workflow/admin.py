from django.contrib import admin

from .models import *
from tasks.models import Task
from utils.admin import reverse_link

def ptasklink(obj):
    return reverse_link(obj)

ptasklink.allow_tags = True
ptasklink.short_description = "Task"

class WorkflowTaskInline(admin.TabularInline):
    model = Task

    def task_type(obj):
        return obj.__class__.__name__

    fields = [ptasklink, 'sortid',task_type, 'description', 'workflow']
    readonly_fields = [ptasklink, task_type, 'sortid', 'description']

    def has_add_permission(self, request):
        return False
    def get_queryset(self, request):
        qs = super(WorkflowTaskInline, self).queryset(request)
        return qs.select_subclasses()

@admin.register(Workflow)
class WorkflowAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'hash','create_date', 'latest_update')
    readonly_fields = ('hash','create_date', 'latest_update')
    exclude = ('hash',)
    inlines = [
        WorkflowTaskInline,
    ]
@admin.register(WorkflowPermission)
class WorkflowPermissionAdmin(admin.ModelAdmin):
    list_display = ('workflow', 'public', 'searchable', 'forkable')
