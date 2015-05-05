from django.contrib import admin

from .models import *

@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    ''' Django-Admin page for listing generic :class:`process.models.Result` entries.

    This aggregates all types of results in a unique list.
    '''
    # we have a custom template on the edit form so we can show the warning about not being able to edit in the generic list view
    change_list_template='admin/change_list_result.html'

    def result_type(obj):
        ''' Custom ModelAdmin field that display the specific model type
        '''
        return obj.__class__.__name__

    def process(obj):
        ''' Custom ModelAdmin field that display the related process
        '''
        return obj.processtaskuser.processtask.process

    def task(obj):
        ''' Custom ModelAdmin field that display the related task
        '''
        return obj.processtaskuser.processtask.task

    def user(obj):
        ''' Custom ModelAdmin field that display the related user
        '''
        return obj.processtaskuser.user

    list_display = (process, task, 'date', 'comment', result_type)
    readonly_fields = ('hash', )
    # we disabled permission to edit/add, since this is for listing the generic entries only
    def has_add_permission(self, request):
        return False
    # we must change the queryset to allow the select to be based on the subclasses type, since the Result is generic
    def get_queryset(self, request):
        qs = super(ResultAdmin, self).get_queryset(request)
        return qs.select_subclasses()

@admin.register(SimpleResult)
class SimpleResultAdmin(admin.ModelAdmin):
    ''' Django-Admin page for listing, adding and editing :class:`process.models.SimpleResult` entries.
    '''
    list_display = ('processtaskuser', 'date', 'comment')
    readonly_fields = ('hash', )
