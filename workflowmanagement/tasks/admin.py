from django.contrib import admin
from django import forms
from django.core.exceptions import ValidationError

from .models import *

def dummy_validator(value):
    return True

class TaskForm(forms.ModelForm):
    dependencies = forms.ModelMultipleChoiceField(queryset=Task.objects.none(), required=False)
    def __init__(self, *args, **kwargs):
        super(TaskForm, self).__init__(*args, **kwargs)
        try:
            initial_dependencies = TaskDependency.objects.filter(maintask=self.instance)

            self.fields['dependencies'].queryset = Task.objects.filter(workflow=self.instance.workflow).exclude(id=self.instance.id)
            self.fields['dependencies'].initial = [task.dependency.id for task in initial_dependencies]

        except:
            pass

    class Meta:
        model = Task
        fields = "__all__"

    def save(self, commit=True):
        dependencies = self.cleaned_data.get('dependencies', None)
        self.instance.replaceDependencies(dependencies)

        return super(TaskForm, self).save(commit=commit)

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    change_list_template='admin/change_list_task.html'
    change_form_template='admin/change_form_task.html'
    form = TaskForm
    list_display = ('title', 'workflow', 'sortid', 'description', 'id', 'task_type')
    readonly_fields = ('id',)
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
    change_form_template='admin/change_form_task.html'
    form = TaskForm
    list_display = ('title', 'workflow', 'sortid', 'description', 'id')
    readonly_fields = ('id',)
    ordering = ('workflow','sortid', 'title')
