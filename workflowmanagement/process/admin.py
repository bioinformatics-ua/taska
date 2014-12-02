from django.contrib import admin

from .models import *

from utils.admin import reverse_link

def ptasklink(obj):
    ''' Custom AdminModel field that displays a link to the django-admin change page for an certain task from a ProcessTask instance.

    Args:
        :obj (ProcessTask): An :class:`process.models.ProcessTask` instance to create the actor link to
    '''
    return reverse_link(obj, name=obj.task)

ptasklink.allow_tags = True
ptasklink.short_description = "Process Task"

def prequest(obj):
    ''' Custom AdminModel field that displays a link to the django-admin change page for an certain task from a ProcessTaskUser instance.

    Args:
        :obj (ProcessTaskUser): An :class:`process.models.ProcessTaskUser` instance to create the actor link to
    '''
    return reverse_link(obj, name='Requests')
prequest.allow_tags = True
prequest.short_description = "Requests"

class ProcessTaskInline(admin.TabularInline):
    ''' ProcessTask inline to be displayed inside a Process instance edit form.

    Allows for rapid access to the group of related ProcessTask instances.
    '''
    model = ProcessTask

    fields = [ptasklink, 'status', 'deadline']
    readonly_fields = [ptasklink, 'status', 'deadline']

    def has_add_permission(self, request):
        return False

@admin.register(Process)
class ProcessAdmin(admin.ModelAdmin):
    ''' Django-Admin page for listing, adding and editing :class:`process.models.Process` entries.
    '''
    list_display = ('workflow', 'executioner', 'hash', 'start_date', 'end_date', 'status', 'removed')
    readonly_fields = ('hash','start_date', 'end_date')

    inlines = [
        ProcessTaskInline
    ]

class ProcessTaskUserInline(admin.TabularInline):
    ''' ProcessTaskUser inline to be displayed inside a ProcessTask instance edit form.

    Allows for rapid access to the group of related ProcessTaskUser instances.
    '''
    model = ProcessTaskUser

    readonly_fields = ['reassign_date', prequest]

@admin.register(ProcessTask)
class ProcessTaskAdmin(admin.ModelAdmin):
    ''' Django-Admin page for listing, adding and editing :class:`process.models.ProcessTask` entries.
    '''
    list_display = ('process', 'task', 'status', 'deadline')
    inlines = [
        ProcessTaskUserInline,
    ]

class RequestInline(admin.TabularInline):
    ''' Request inline to be displayed inside a ProcessTaskUser instance edit form.

    Allows for rapid access to the group of related Requests instances.
    '''
    model = Request

@admin.register(ProcessTaskUser)
class ProcessTaskUserAdmin(admin.ModelAdmin):
    ''' Django-Admin page for listing, adding and editing :class:`process.models.ProcessTaskUser` entries.
    '''
    list_display = ('processtask', 'user', 'reassigned', 'reassign_date')
    inlines = [
        RequestInline
    ]

@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    ''' Django-Admin page for listing, adding and editing :class:`process.models.Request` entries.
    '''
    def ptask(self, obj):
        ''' Custom ModelAdmin field that displays the related ProcessTask
        '''
        return obj.processtaskuser.processtask
    list_display = (ptask, 'type', 'title', 'message', 'date')
