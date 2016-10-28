# coding=utf-8

from process.models import *
from process.serializers.RequestSerializer import  RequestSerializer
from process.filters.RequestFilter import  RequestFilter

from rest_framework import viewsets, mixins, status, filters
from rest_framework.response import Response

from utils.api_related import create_serializer, AliasOrderingFilter

from django.http import Http404

class RequestsViewSet(  mixins.CreateModelMixin,
                        mixins.UpdateModelMixin,
                        mixins.ListModelMixin,
                        mixins.RetrieveModelMixin,
                        mixins.DestroyModelMixin,
                        viewsets.GenericViewSet):
    """
    API for Process Requests manipulation

        Note: All methods on this class pertain to user owned processes
    """
    queryset = Request.objects.none()
    serializer_class = RequestSerializer
    lookup_field = 'hash'

    filter_backends = [filters.DjangoFilterBackend, AliasOrderingFilter]
    filter_class = RequestFilter

    ordering_fields = ('hash', 'type', 'title', 'message', 'date', 'resolved', 'process', 'task', 'user')

    ordering_map = {
        'process': 'processtaskuser__processtask__process__hash',
        'task': 'processtaskuser__processtask__task__hash',
        'user': 'processtaskuser__user',

    }

    # we must override queryset to filter by authenticated user
    def get_queryset(self):
        return Request.all(executioner=self.request.user)

    def get_object(self):
        obj = None
        try:
            obj = Request.objects.get(
                Q(public=True) |
                Q(processtaskuser__processtask__process__executioner=self.request.user) |
                Q(processtaskuser__user=self.request.user),
                hash=self.kwargs['hash']
            )
        except Request.DoesNotExist:
            pass

        if obj == None:
            raise Http404('No object')

        self.check_object_permissions(self.request, obj)
        return obj

    def list(self, request, *args, **kwargs):
        """
        Return a list of executioner-related requests

        """
        return super(RequestsViewSet, self).list(request, args, kwargs)


    def create(self, request, *args, **kwargs):
        """
        Insert a new request

        """
        request.data[u'user'] = request.user.id

        serializer, headers = create_serializer(self, request)
        process = serializer.instance.processtaskuser.processtask.process
        process_owner = process.executioner

        History.new(event=History.ADD, actor=request.user, object=serializer.instance, authorized=[process_owner], related=[process])

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """
        Update an already existing request

        """
        request.data[u'user'] = request.user.id

        instance = self.get_object()

        serializer = RequestSerializer(instance=instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        serializer = RequestSerializer(instance=instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        process = serializer.instance.processtaskuser.processtask.process
        process_owner = process.executioner

        History.new(event=History.EDIT, actor=request.user, object=instance, authorized=[process_owner], related=[process])

        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a request, by id

        """
        instance = self.get_object()

        process = instance.processtaskuser.processtask.process
        process_owner = process.executioner

        History.new(event=History.ACCESS, actor=request.user, object=instance, authorized=[process_owner], related=[process])

        return Response(RequestSerializer(instance).data)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        """
        Delete a request, by id
        """
        instance = self.get_object()

        instance.removed = True
        instance.save()

        process = instance.processtaskuser.processtask.process
        process_owner = process.executioner

        History.new(event=History.DELETE, actor=request.user, object=instance, authorized=[process_owner], related=[process])

        return Response(status=status.HTTP_204_NO_CONTENT)