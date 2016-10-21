# coding=utf-8

from process.models import *
from process.serializers.MyProcessTaskUserDetailSerializer import  MyProcessTaskUserDetailSerializer

from rest_framework import generics
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, mixins, status, filters, views
from rest_framework.decorators import list_route, detail_route
from rest_framework.response import Response
from django.http import Http404


class MyTask(mixins.CreateModelMixin,
                     mixins.UpdateModelMixin,
                     mixins.RetrieveModelMixin,
                     mixins.DestroyModelMixin,
                     viewsets.GenericViewSet):

    #generics.RetrieveAPIView):
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

    @detail_route(methods=['post'])
    def accept(self, request, hash=None):
        hashField = request.data['ptuhash']

        obj = None
        try:
            obj = ProcessTaskUser.all().get(
                hash=hashField,
                user=self.request.user
            )
            obj.accept()
        except ProcessTaskUser.DoesNotExist:
            raise Http404

        return Response(status=status.HTTP_204_NO_CONTENT)

    @detail_route(methods=['post'])
    def reject(self, request, hash=None):
        hashField = request.data['ptuhash']

        obj = None
        try:
            obj = ProcessTaskUser.all().get(
                hash=hashField,
                user=self.request.user
            )
            obj.reject()
        except ProcessTaskUser.DoesNotExist:
            raise Http404

        return Response(status=status.HTTP_204_NO_CONTENT)