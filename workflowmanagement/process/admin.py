from django.contrib import admin

from .models import *

from utils.admin import reverse_link

def ptasklink(obj):
    return reverse_link(obj, name=obj.task)

ptasklink.allow_tags = True
ptasklink.short_description = "Process Task"

def prequest(obj):
    return reverse_link(obj, name='Requests')
prequest.allow_tags = True
prequest.short_description = "Requests"

class ProcessTaskInline(admin.TabularInline):
    model = ProcessTask

    fields = [ptasklink, 'status', 'deadline']
    readonly_fields = [ptasklink, 'status', 'deadline']

    def has_add_permission(self, request):
        return False

@admin.register(Process)
class ProcessAdmin(admin.ModelAdmin):
    list_display = ('workflow', 'executioner', 'hash', 'start_date', 'end_date', 'status', 'removed')
    readonly_fields = ('hash','start_date', 'end_date')

    inlines = [
        ProcessTaskInline
    ]

class ProcessTaskUserInline(admin.TabularInline):
    model = ProcessTaskUser

    readonly_fields = ['reassign_date', prequest]

@admin.register(ProcessTask)
class ProcessTaskAdmin(admin.ModelAdmin):
    list_display = ('process', 'task', 'status', 'deadline')
    inlines = [
        ProcessTaskUserInline,
    ]

class RequestInline(admin.TabularInline):
    model = Request

@admin.register(ProcessTaskUser)
class ProcessTaskUserAdmin(admin.ModelAdmin):
    list_display = ('processtask', 'user', 'reassigned', 'reassign_date')
    inlines = [
        RequestInline
    ]

@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    def ptask(self, obj):
        return obj.processtaskuser.processtask
    list_display = (ptask, 'type', 'title', 'message', 'date')
