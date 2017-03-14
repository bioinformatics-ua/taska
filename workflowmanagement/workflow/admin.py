from django.contrib import admin

from workflow.models import *
from tasks.models import Task
from utils.admin import reverse_link

def ptasklink(obj):
    ''' Custom AdminModel field that displays a link to the django-admin change page for an certain task from a Task instance.

    Args:
        :obj (Task): An :class:`process.models.Task` instance to create the actor link to
    '''
    return reverse_link(obj)

ptasklink.allow_tags = True
ptasklink.short_description = "Task"

class WorkflowTaskInline(admin.TabularInline):
    ''' Tasl inline to be displayed inside a Workflow instance edit form.

    Allows for rapid access to the group of related Task instances.
    '''
    model = Task

    def task_type(obj):
        ''' Custom ModelAdmin field that display the specific model type
        '''
        return obj.__class__.__name__

    fields = [ptasklink, 'sortid',task_type, 'description', 'workflow']
    readonly_fields = [ptasklink, task_type, 'sortid', 'description']

    # we disabled permission to edit/add, since this is for listing the generic entries only
    def has_add_permission(self, request):
        return False
    # we must change the queryset to allow the select to be based on the subclasses type, since the Task is generic
    # def get_queryset(self, request):
    #     qs = super(WorkflowTaskInline, self).queryset(request)
    #     return qs.select_subclasses()

@admin.register(Workflow)
class WorkflowAdmin(admin.ModelAdmin):
    ''' Django-Admin page for listing, adding and editing :class:`workflow.models.Workflow` entries.
    '''
    list_display = ('title', 'owner', 'hash','create_date', 'latest_update')
    readonly_fields = ('hash','create_date', 'latest_update')
    exclude = ('hash',)
    inlines = [
        WorkflowTaskInline,
    ]
@admin.register(WorkflowPermission)
class WorkflowPermissionAdmin(admin.ModelAdmin):
    ''' Django-Admin page for listing, adding and editing :class:`workflow.models.WorkflowPermission` entries.
    '''
    list_display = ('workflow', 'public', 'searchable', 'forkable', 'visibility')
