from rest_framework import serializers, permissions
from oauth2_provider.ext.rest_framework import TokenHasScope
from messagesystem.models import Message

class MessageSerializer(serializers.ModelSerializer):
    '''Serializer to handle :class:`messagesystem.models.Message` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''

    class Meta:
        model = Message
        fields = [
            'title',
            'message',
            'object_id',
            'object_type',
        ]
        #exclude = ['sender','receiver']
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
