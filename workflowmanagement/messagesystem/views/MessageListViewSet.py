from django.contrib.contenttypes.models import ContentType
from rest_framework import viewsets, mixins, generics, status
from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.reverse import reverse
from rest_framework.response import Response

from messagesystem.models import Message
from messagesystem.serializers.MessageListSerializer import MessageListSerializer
from process.models import Process


class MessageListViewSet(ListAPIView):
    queryset = Message.objects.none()
    serializer_class = MessageListSerializer

    def get_queryset(self):
        hash = self.request.query_params.get('hash', None)
        process = Process.all().filter(hash=hash).first()
        objType = ContentType.objects.get(model="process")
        tmp = Message.objects.all().filter(object_type=objType, object_id=process.id)
        for msg in tmp:
            msg.hash = hash

        return tmp
