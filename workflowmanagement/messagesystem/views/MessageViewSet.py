from django.contrib.contenttypes.models import ContentType
from rest_framework import viewsets, mixins, generics, status
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.reverse import reverse
from rest_framework.response import Response


from messagesystem.models import Message
from messagesystem.serializers.MessageSerializer import MessageSerializer



class MessageViewSet(CreateAPIView):
    queryset = Message.objects.none()
    serializer_class = MessageSerializer

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(sender=self.request.user)
            


