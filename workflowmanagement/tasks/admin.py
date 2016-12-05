from django.contrib import admin
from django import forms
from django.core.exceptions import ValidationError

from .models import *

class TaskForm(forms.ModelForm):
    ''' The ModelForm used on the Task ModelAdmin page.

    The ModelAdmin for Tasks's can't rely on the automatic generated form, since we also should account for the
    dependencies that are on a separated table. This dependencies also have a workflow restriction and must be custom
    populated. This custom form takes care of it.
    '''
    dependencies = forms.ModelMultipleChoiceField(queryset=Task.objects.none(), required=False)
    def __init__(self, *args, **kwargs):
        super(TaskForm, self).__init__(*args, **kwargs)
        try:
            initial_dependencies = TaskDependency.objects.filter(maintask=self.instance)

            # dependencies can only be already existing tasks on the same workflow.
            self.fields['dependencies'].queryset = Task.objects.filter(workflow=self.instance.workflow).exclude(id=self.instance.id)
            self.fields['dependencies'].initial = [task.dependency.id for task in initial_dependencies]

        except:
            pass

    class Meta:
        model = Task
        fields = "__all__"
    # we must have a custom save handler, since we need to process the dependencies values as they are not processed by the usual cycle
    def save(self, commit=True):
        dependencies = self.cleaned_data.get('dependencies', None)
        self.instance.replaceDependencies(dependencies)

        return super(TaskForm, self).save(commit=commit)

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    ''' Django-Admin page for listing generic :class:`tasks.models.Task` entries.

    This aggregates all types of Tasks in a unique list.
    '''
    # we must have a custom template to warn about not being able to add tasks directly since this generically shows all tasks
    change_list_template='admin/change_list_task.html'
    # we must have a custom template to the add/edit form since we have javascript behaviour, because of the dependency list.
    change_form_template='admin/change_form_task.html'
    form = TaskForm
    list_display = ('title', 'workflow', 'sortid', 'description', 'id', 'task_type')
    readonly_fields = ('id', 'hash', 'ttype')

    ordering = ('workflow','sortid', 'title')

    help_text = "This is meant to be used as a generic overview of all tasks, not as a place to add/edit/delete tasks. Tasks can be of different kinds, and should be added through they're respective models (such as SimpleTask, or other implementations)"
    def has_add_permission(self, request):
        return False
    def task_type(self, obj):
        return obj.__class__.__name__

    def get_queryset(self, request):
        qs = super(TaskAdmin, self).queryset(request)
        return qs.select_subclasses()

@admin.register(SimpleTask)
class SimpleTaskAdmin(admin.ModelAdmin):
    ''' Django-Admin page for listing, adding and editing :class:`tasls.models.SimpleTask` entries.
    '''
    change_form_template='admin/change_form_task.html'
    form = TaskForm
    list_display = ('title', 'workflow', 'sortid', 'description', 'id')
    readonly_fields = ('id', 'hash', 'ttype')
    ordering = ('workflow','sortid', 'title')
