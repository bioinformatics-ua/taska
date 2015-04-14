# coding=utf-8
import django_filters
from rest_framework import renderers, serializers, viewsets, permissions, mixins, status
from rest_framework.decorators import api_view, detail_route, list_route
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework import status, filters

from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated

from django.contrib.auth.models import User
from oauth2_provider.ext.rest_framework import TokenHasReadWriteScope, TokenHasScope

from models import *

from django.apps import apps
from django.db import transaction

from history.models import History

from utils.api_related import create_serializer, AliasOrderingFilter


class GenericResourceSerializer(serializers.ModelSerializer):
    type = serializers.CharField(write_only=True)

    def to_representation(self, obj):
        return obj.to_representation(obj)

    def create(self, data):
        serializer = data.pop('serializer')

        return serializer.create(data)

    def update(self, instance, data):
        serializer = data.pop('serializer')

        return serializer.update(instance, data)

    def to_internal_value(self, data):
        if data.get('type', False):
            this_model = apps.get_model(data.pop('type'))

            serializer = this_model.init_serializer(partial=True)
            validated = serializer.to_internal_value(data)
            validated['serializer'] = serializer

            return validated

        raise Exception('Found invalid resource type to be processed.')

    class Meta:
        model = Resource


# Serializers define the API representation.
class ResourceSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()

    def get_type(self, obj):
        return obj.type()

    @transaction.atomic
    def create (self, data):
        '''dependencies = []
        try:
            dependencies = data.pop('dependencies')
        except KeyError:
            pass
        # this is generically, some custom tasks can override this behaviour
        task =  self.Meta.model.objects.create(**data)

        self.__create_tasks(task, dependencies)

        return task
        '''
        return None

    @transaction.atomic
    def update(self, instance, data):
        '''dependencies = None
        try:
            dependencies = data.pop('dependencies')
        except KeyError:
            pass

        for attr, value in data.items():
            setattr(instance, attr, value)

        instance.save()

        # Since they are nested, we wont now if we should remove a entry or not
        # so we presume when somebody passes the deps nested array this will
        # replace the old ones
        TaskDependency.objects.filter(maintask=instance).delete()

        self.__create_tasks(instance, dependencies)

        return instance
        '''
        return None

    class Meta:
        model = Resource
        #write_only_fields = ('workflow',)
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        #exclude = ('id', 'removed', 'workflow', 'ttype')
        extra_kwargs = {'hash': {'required': False} }

class FileSerializer(ResourceSerializer):
    class Meta:
        model = File
        #exclude = ('workflow',)
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        #fread_only_fields = ('workflow',)

class ResourceFilter(django_filters.FilterSet):
    type = django_filters.CharFilter(name="ttype")
    class Meta:
        model = Resource
        fields = ['hash', "create_date", "latest_update", "type"]


# ViewSets define the view behavior.
class ResourceViewSet(
                    mixins.CreateModelMixin,
                    mixins.UpdateModelMixin,
                    mixins.ListModelMixin,
                    mixins.RetrieveModelMixin,
                    viewsets.GenericViewSet):
    """
    API for Resource manipulation

    """
    queryset = Resource.objects.none()
    serializer_class = GenericResourceSerializer
    lookup_field = 'hash'

    filter_backends = [filters.DjangoFilterBackend, AliasOrderingFilter]
    filter_class = ResourceFilter

    ordering_fields = ['hash', 'create_date', 'latest_update', 'type']
    ordering_map = {
        'type': 'ttype'
    }

    # we must override queryset to filter
    def get_queryset(self):
        return Resource.all()

    def list(self, request, *args, **kwargs):
        """
        Return a list of resources

        """
        return super(ResourceViewSet, self).list(request, args, kwargs)

    def create(self, request, *args, **kwargs):
        """
        Add a resource

        """
        serializer, headers = create_serializer(self, request)

        History.new(event=History.ADD, actor=request.user, object=serializer.instance)

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """
        Update a resource

        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        serializer = instance.init_serializer(instance=instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        History.new(event=History.EDIT, actor=request.user, object=instance)

        return Response(serializer.data)
        #return super(TaskViewSet, self).partial_update(request, args, kwargs)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a resource details, by hash
        """
        History.new(event=History.ACCESS, actor=request.user, object=self.get_object())

        return super(ResourceViewSet, self).retrieve(request, args, kwargs)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        """
        Delete a resource, by hash

        """
        instance = self.get_object()

        instance.removed = True
        instance.save()

        History.new(event=History.DELETE, actor=request.user, object=instance)

        return Response(status=status.HTTP_204_NO_CONTENT)
