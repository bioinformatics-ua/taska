from rest_framework import serializers, permissions
from oauth2_provider.ext.rest_framework import TokenHasScope
from messagesystem.models import Message
from django.contrib.auth.models import User
from django.db import transaction
from django.contrib.contenttypes.models import ContentType
from accounts.serializers.UserSerializer import UserSerializer

from messagesystem.views.MessageListUsersView import MessageListUsersView

class MessageSerializer(serializers.ModelSerializer):
    '''Serializer to handle :class:`messagesystem.models.Message` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    hash = serializers.CharField(allow_null=True)

    class Meta:
        model = Message
        fields = [
            'title',
            'message',
            'receiver',
            #'object_id',
            'hash',
            'object_type',
        ]
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

    @transaction.atomic
    def save(self, sender):
        hash = self.validated_data['hash']
        objType = self.validated_data['object_type']

        obj = objType.model_class().all().filter(hash=hash).first()

        if (obj != None):
            receivers = self.getReceivers(receiver=self.validated_data['receiver'], object=obj, sender=sender)

            self.instance = Message.new(title=self.validated_data['title'], message=self.validated_data['message'], sender=sender, receiver=receivers, object=obj)
            self.instance.hash = hash #If I don't add the hash into instace, give me a error
            return self.instance


    def getReceivers(self, receiver=None, object=None, sender=None):
        #Receivers are sended in the service
        if(receiver != None):
            if(len(receiver) > 0):
                return receiver

        return MessageListUsersView.getReceivers(receiver, object, sender)

