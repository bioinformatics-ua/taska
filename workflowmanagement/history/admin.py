from django.contrib import admin

from .models import *

from utils.admin import reverse_link

def actor_link(obj):
    ''' Custom AdminModel field that displays a link to the django-admin change page for an certain actor from a History instance.

    Args:
        :obj (History): An :class:`history.models.History` instance to create the actor link to
    '''
    return reverse_link(obj.actor)

actor_link.allow_tags = True
actor_link.short_description = "Actor"
actor_link.admin_order_field = 'actor'

def object_link(obj):
    ''' Custom AdminModel field that displays a link to the django-admin change page for the generic object from a History instance.

    Args:
        :obj (Model): An :class:`django.db.models.Model` instance to create the change page to
    '''
    return reverse_link(obj.object)

object_link.allow_tags = True
object_link.short_description = "Object"
object_link.admin_order_field = 'object_id'

@admin.register(History)
class HistoryAdmin(admin.ModelAdmin):
    ''' Django-Admin page for listing, adding and editing :class:`history.models.History` entries.
    '''
    search_fields = ('id', 'actor__username', 'event', 'date')
    list_display = ('id', actor_link, 'event', object_link, 'date')
