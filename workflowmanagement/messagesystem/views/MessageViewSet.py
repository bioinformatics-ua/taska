from django.contrib.contenttypes.models import ContentType
from rest_framework import viewsets, mixins, generics
from rest_framework.generics import CreateAPIView
from rest_framework.reverse import reverse

from messagesystem.models import Message
from messagesystem.serializers.MessageSerializer import MessageSerializer


class MessageViewSet(CreateAPIView):
    queryset = Message.objects.none()
    serializer_class = MessageSerializer
    lookup_field = 'hash'

    def perform_create(self, serializer):
        #send mail and so on
        objType = ContentType.objects.get_for_id(self.request.data['object_type'])

        try:
            print self.kwargs['hash']

            #Look for id of object using hash
            #serializer.save(sender=self.request.user, object_id=id)
        except:
            pass
            #Use the id in the serializer only
            #serializer.save(sender=self.request.user)
