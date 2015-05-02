from django.contrib import admin

# Register your models here.
from models import Form, FormTask

from tasks.admin import TaskForm

@admin.register(Form)
class FormAdmin(admin.ModelAdmin):
    ''' Django-Admin page for listing, adding and editing :class:`form.models.Form` entries.
    '''
    list_display = ('title', 'creator', 'created_date', 'latest_update')

@admin.register(FormTask)
class FormTaskAdmin(admin.ModelAdmin):
    ''' Django-Admin page for listing, adding and editing :class:`form.models.FormTask` entries.
    '''
    change_form_template='admin/change_form_task.html'
    form = TaskForm
    list_display = ('title', 'workflow', 'sortid', 'description', 'id', 'form')
    readonly_fields = ('id', 'hash', 'ttype')
    ordering = ('workflow','sortid', 'title', 'form')
