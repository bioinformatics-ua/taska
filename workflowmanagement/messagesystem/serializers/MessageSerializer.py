from rest_framework import serializers, permissions
from oauth2_provider.ext.rest_framework import TokenHasScope
from messagesystem.models import Message

class MessageSerializer(serializers.ModelSerializer):
    '''Serializer to handle :class:`messagesystem.models.Message` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''

    #EM CONSTRUCAO AINDA

    #event = serializers.SerializerMethodField()
    #object_type = serializers.SerializerMethodField()
    #object_repr = serializers.SerializerMethodField()
    #actor_repr = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ('id', 'title')

        #exclude = ['object_id', 'authorized']
        #permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        #extra_kwargs = {'hash': {'required': False}}
