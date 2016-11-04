from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import User

import django.dispatch

class Message(models.Model):
    '''Represents a message to be sended by some user to a group of users

    The `object` is a generic foreign key to any model in the system (Workflow, Task, Process, etc), any model is valid.

    '''

    hash            = models.CharField(max_length=50, default="ERROR")
    title           = models.CharField(max_length=100, null=True)
    message         = models.TextField(null=True)
    date            = models.DateTimeField(auto_now_add=True)
    sender          = models.ForeignKey(User)
    receiver        = models.ManyToManyField(User, related_name='receiver')

    # generic foreign key that refers to the object related to this action
    object_type     = models.ForeignKey(ContentType)
    object_id       = models.PositiveIntegerField()
    object          = GenericForeignKey('object_type', 'object_id')

    def __str__(self):
        return self.title + ' sended by ' + self.sender.name

    @classmethod
    def new(self, title, message, sender, receiver, object):
        """
        Generates a new generic history object
        """
        action = Message(title=title, message=message, sender=sender, object=object)

        action.save()

        if receiver != None:
            for elem in receiver:
                action.receiver.add(elem)

        print 'NEW MESSAGE'

        self.post_new.send(sender=self.__class__, instance=action)

        return action

    # Signals
    post_new = django.dispatch.Signal(providing_args=["instance"])