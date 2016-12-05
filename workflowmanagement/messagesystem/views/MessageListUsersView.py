from django.contrib.contenttypes.models import ContentType
from rest_framework import viewsets, mixins, generics, status
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.reverse import reverse
from rest_framework.response import Response

from messagesystem.models import Message
from accounts.api import UserSerializer
from process.models import *

import json
class MessageListUsersView(ListAPIView):
    queryset = Message.objects.none()
    serializer_class = UserSerializer

    def get_queryset(self):
        """
            Retrieves a list of user assigned a object (can be a process, a task, ...)
        """
        users = []
        objModel = self.request.query_params.get('object', None)
        objType = ContentType.objects.get(model=objModel)
        hash = self.request.query_params.get('hash', None)

        obj = objType.model_class().all().filter(hash=hash).first()

        return self.getReceivers(receiver=users, object=obj)

    @staticmethod
    def getReceivers(receiver=None, object=None, sender=None):
        # ADD there the condition if I want defined receivers through the object instance
        # If there is no receivers in the service
        if (isinstance(object, Process)):
            for user in object.getAllUsersEnvolved(notification=False):
                receiver += [user]
            return receiver
        else:
            print "SOMETHING WRONG! DEFAULT RECEIVERS ARE NOT DEFINED!!!!"