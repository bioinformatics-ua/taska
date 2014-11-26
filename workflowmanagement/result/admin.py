from django.contrib import admin

from .models import *

@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    change_list_template='admin/change_list_result.html'

    def result_type(obj):
        return obj.__class__.__name__

    def process(obj):
        return obj.processtaskuser.processtask.process

    def task(obj):
        return obj.processtaskuser.processtask.task

    def user(obj):
        return obj.processtaskuser.user

    list_display = (process, task, 'date', 'comment', result_type)
    def has_add_permission(self, request):
        return False

    def get_queryset(self, request):
        qs = super(ResultAdmin, self).queryset(request)
        return qs.select_subclasses()

@admin.register(SimpleResult)
class SimpleResultAdmin(admin.ModelAdmin):
    list_display = ('processtaskuser', 'date', 'comment')
