from rest_framework import viewsets, mixins

from messagesystem.models import Message
from messagesystem.serializers import MessageSerializer


class MessageViewSet(viewsets.GenericViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer