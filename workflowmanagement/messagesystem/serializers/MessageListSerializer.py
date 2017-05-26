from rest_framework import serializers, permissions
from oauth2_provider.ext.rest_framework import TokenHasScope
from messagesystem.models import Message
from django.contrib.auth.models import User
from django.db import transaction
from django.contrib.contenttypes.models import ContentType
from accounts.api import UserSerializer

from messagesystem.views.MessageListUsersView import MessageListUsersView

class MessageListSerializer(serializers.ModelSerializer):
    '''Serializer to handle :class:`messagesystem.models.Message` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    receiver = UserSerializer(many=True)
    date = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'title',
            'message',
            'receiver',
            'date',
        ]
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

    def get_date(self, obj):
        '''
            Returns a ISO 8601 formatted date representation for this process start date
        '''
        return obj.date.strftime("%Y-%m-%d %H:%M")