from django.contrib.contenttypes.models import ContentType
from rest_framework import viewsets, mixins, generics
from rest_framework.generics import CreateAPIView
from rest_framework.reverse import reverse

from messagesystem.models import Message
from messagesystem.serializers.MessageSerializer import MessageSerializer

from process.models import Process, ProcessTask


class MessageViewSet(CreateAPIView):
    queryset = Message.objects.none()
    serializer_class = MessageSerializer
    lookup_field = 'hash'

    def perform_create(self, serializer):
        objType = ContentType.objects.get_for_id(self.request.data['object_type'])

        #obj = objType.model_class().all().filter(hash=self.request.data['hash']).first()

        try:
            obj = objType.model_class().all().filter(hash=self.kwargs['hash']).first()
        except:
            pass

        if(obj != None):
            receivers = self.getReceivers(receiver=self.request.data['receiver'], object=obj, sender=self.request.user)
            # do a models.message.new that it will create and send a email too
            message = serializer.save(title=self.request.data['title'], message=self.request.data['message'], sender=self.request.user,
                        receiver=[receivers], object=obj)
            Message.sendMessage(message)


    #Refactor this method
    def getReceivers(self, receiver=None, object=None, sender=None):
        print "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
        return receiver

