from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import User

import django.dispatch

class Message(models.Model):
    '''Represents a message to be sended by some user to a group of users

    The `object` is a generic foreign key to any model in the system (Workflow, Task, Process, etc), any model is valid.

    '''

    #hash            = models.CharField(max_length=50, default="ERROR")
    title           = models.CharField(max_length=100, null=True)
    message         = models.TextField(null=True)
    date            = models.DateTimeField(auto_now_add=True)
    sender          = models.ForeignKey(User)
    receiver        = models.ManyToManyField(User, related_name='receiver', blank=True)

    # generic foreign key that refers to the object related to this action
    object_type     = models.ForeignKey(ContentType)
    object_id       = models.PositiveIntegerField()
    object          = GenericForeignKey('object_type', 'object_id')

    def __str__(self):
        return self.title + ' sended by ' + self.sender.get_full_name()

    def sender_repr(self):
        """
            Returns textual representation of the sender,
            preferably a full name, but an email if no name is available.
        """
        tmp = self.sender.get_full_name()

        if tmp != None:
            return tmp

        return self.sender.email

    def obj_repr(self):
        """
            Returns a representation of the generic object
        """
        return self.object.__unicode__()

    @classmethod
    def sendMessage(self, obj):
        """
        Send the message
        """
        self.post_new.send(sender=self.__class__, instance=obj)

    # Signals
    post_new = django.dispatch.Signal(providing_args=["instance"])