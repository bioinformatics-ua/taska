# coding=utf-8

from process.models import *
from process.serializers.MyProcessTaskUserDetailSerializer import  MyProcessTaskUserDetailSerializer

from rest_framework import filters, generics
from django.shortcuts import get_object_or_404

class MyTask(generics.RetrieveAPIView):
    queryset = ProcessTaskUser.all()
    serializer_class = MyProcessTaskUserDetailSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    lookup_field = 'hash'

    def get_object(self):
        queryset = self.get_queryset()
        filter = {
            'hash': self.kwargs['hash']
        }

        obj = get_object_or_404(queryset, **filter)
        self.check_object_permissions(self.request, obj)
        return obj