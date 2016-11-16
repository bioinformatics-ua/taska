from rest_framework import serializers, permissions
from oauth2_provider.ext.rest_framework import TokenHasScope
from messagesystem.models import Message
from django.contrib.auth.models import User

class MessageSerializer(serializers.ModelSerializer):
    '''Serializer to handle :class:`messagesystem.models.Message` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    #object_id = serializers.IntegerField(allow_null=True)
    #hash = serializers.CharField()

    class Meta:
        model = Message
        fields = [
            'title',
            'message',
            'receiver',
            #'object_id',
            #'hash',
            'object_type',
        ]
        #exclude = ['sender']
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
