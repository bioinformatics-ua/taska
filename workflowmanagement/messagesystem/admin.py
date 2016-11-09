from django.contrib import admin

from messagesystem.models import Message
from utils.admin import reverse_link


def sender_link(obj):
    ''' Custom AdminModel field that displays a link to the django-admin change page for an certain actor from a Message instance.

    Args:
        :obj (Message): An :class:`messagesystem.models.Message` instance to create the sender link to
    '''
    return reverse_link(obj.sender)

sender_link.allow_tags = True
sender_link.short_description = "Sender"
sender_link.admin_order_field = 'Sender'

def object_link(obj):
    ''' Custom AdminModel field that displays a link to the django-admin change page for the generic object from a Message instance.

    Args:
        :obj (Model): An :class:`django.db.models.Model` instance to create the change page to
    '''
    return reverse_link(obj.object)

object_link.allow_tags = True
object_link.short_description = "Object"
object_link.admin_order_field = 'object_id'

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    search_fields = ('id', 'sender__username', 'title', 'date')
    list_display = ('id', sender_link, 'title', 'message', object_link, 'date')