from django.contrib import admin

from .models import *

class ResourceCommentInline(admin.TabularInline):
    ''' Comment inline to be displayed inside a Resource instance edit form.

    Allows for rapid access to the group of related resource comments
    '''
    model = ResourceComment

    fields = ['comment', 'user', 'create_date', 'latest_update', 'removed']
    readonly_fields = ['create_date', 'latest_update', 'removed']

    # we disabled permission to edit/add, since this is for listing the generic entries only
    def has_add_permission(self, request):
        return True

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    ''' Django-Admin page for listing generic :class:`material.models.Resource` entries.

    This aggregates all types of resources in a unique list.
    '''
    # we have a custom template on the edit form so we can show the warning about not being able to edit in the generic list view
    change_list_template='admin/change_list_resource.html'

    def resource_type(obj):
        ''' Custom ModelAdmin field that display the specific model type
        '''
        return obj.__class__.__name__

    list_display = ('hash', 'create_date', 'latest_update', resource_type)
    readonly_fields = ('hash', 'ttype')
    inlines = [ResourceCommentInline]
    # we disabled permission to edit/add, since this is for listing the generic entries only
    def has_add_permission(self, request):
        return False
    # we must change the queryset to allow the select to be based on the subclasses type, since the Resource is generic
    def get_queryset(self, request):
        qs = super(ResourceAdmin, self).queryset(request)
        return qs.select_subclasses()

@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    ''' Django-Admin page for listing, adding and editing :class:`material.models.File` entries.
    '''
    list_display = ('hash', 'create_date', 'latest_update', 'file')
    readonly_fields = ('hash', 'ttype')
    inlines = [ResourceCommentInline]
