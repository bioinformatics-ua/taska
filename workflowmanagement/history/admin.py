from django.contrib import admin

from .models import *

from utils.admin import reverse_link

def actor_link(obj):
    return reverse_link(obj.actor)

actor_link.allow_tags = True
actor_link.short_description = "Actor"
actor_link.admin_order_field = 'actor'

def object_link(obj):
    return reverse_link(obj.object)

object_link.allow_tags = True
object_link.short_description = "Object"
object_link.admin_order_field = 'object_id'

@admin.register(History)
class HistoryAdmin(admin.ModelAdmin):
    search_fields = ('id', 'actor__username', 'event', 'date')
    list_display = ('id', actor_link, 'event', object_link, 'date')
