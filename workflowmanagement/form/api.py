import django_filters

from rest_framework import renderers, serializers, viewsets, permissions, mixins
from rest_framework.decorators import api_view, detail_route, list_route
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework import status, filters, generics

from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated

from django.contrib.auth.models import User
from django.db import transaction
from oauth2_provider.ext.rest_framework import TokenHasReadWriteScope, TokenHasScope

from tasks.api import TaskSerializer

from result.api import ResultSerializer

from models import *

from history.models import History
from django.db.models import Q

from django.http import Http404

import json

from django.shortcuts import get_object_or_404

from utils.api_related import create_serializer, AliasOrderingFilter

from process.models import ProcessTask

class JSONSerializerField(serializers.Field):
    '''Custom type of field that allows a model string field to be serialized/deserialized to and from json, nested inside
    a django-rest-framework serializer.
    '''
    def to_internal_value(self, data):
        ''' Converts json to str for model saving.
        '''
        try:
            return json.dumps(data)

        except ValueError:
            return None

    def to_representation(self, value):
        ''' Converts str to json for serialization.
        '''
        try:
            return json.loads(value)

        except ValueError:
            return None

class FormSerializer(serializers.ModelSerializer):
    '''Serializer to handle :class:`form.models.Form` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    schema = JSONSerializerField()

    class Meta:
        model = Form
        exclude = ('id', 'removed')
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]



class FormTaskSerializer(TaskSerializer):
    '''Serializer to handle :class:`form.models.FormTask` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    form = serializers.SlugRelatedField(queryset=Form.all(), slug_field='hash')
    form_repr = serializers.SerializerMethodField()

    class Meta(TaskSerializer.Meta):
        model = FormTask
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

    def get_form_repr(self, obj):
        '''Includes a form serialized representation to the FormTask serializer.
        '''
        return FormSerializer(obj.form).data

class FormResultSerializer(ResultSerializer):
    '''Serializer to handle :class:`form.models.FormResult` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    answer = JSONSerializerField()

    class Meta(ResultSerializer.Meta):
        model = FormResult
        read_only_fields = ('workflow',)

class FormFilter(django_filters.FilterSet):
    '''Allows the filtering of a django-rest-framework generic viewset by the several types of fields present in a Form
    '''
    class Meta:
        model = Form
        fields = ('hash', 'title', 'creator', 'schema', 'created_date', 'latest_update', 'public')

# ViewSets define the view behavior.
class FormViewSet(  mixins.CreateModelMixin,
                        mixins.UpdateModelMixin,
                        mixins.ListModelMixin,
                        mixins.RetrieveModelMixin,
                        mixins.DestroyModelMixin,
                        viewsets.GenericViewSet):
    """
    API for Form manipulation

        Note: All methods on this class pertain to user owned forms
    """
    queryset = Form.objects.none()
    serializer_class = FormSerializer
    lookup_field = 'hash'

    filter_backends = [filters.DjangoFilterBackend, AliasOrderingFilter]
    filter_class = FormFilter

    ordering_fields = ('hash', 'title', 'creator', 'schema', 'created_date', 'latest_update', 'public')

    # we must override queryset to filter by authenticated user
    def get_queryset(self):
        ''' Custom queryset which filters all forms so only owned forms are displayed, when retrieving lists.
        '''
        return Form.all(creator=self.request.user)

    def list(self, request, *args, **kwargs):
        """
        Return a list of creator-related forms

        """
        return super(FormViewSet, self).list(request, args, kwargs)


    def create(self, request, *args, **kwargs):
        """
        Insert a new Form

        """
        request.data[u'creator'] = request.user.id

        serializer, headers = create_serializer(self, request)

        History.new(event=History.ADD, actor=request.user, object=serializer.instance)

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """
        Update an already existing form

        """
        request.data[u'creator'] = request.user.id

        instance = self.get_object()

        serializer = FormSerializer(instance=instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        History.new(event=History.EDIT, actor=request.user, object=instance)

        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a form, by id

        """
        instance = self.get_object()
        History.new(event=History.ACCESS, actor=request.user, object=instance)

        return Response(FormSerializer(instance).data)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        """
        Delete a form, by id
        """
        instance = self.get_object()

        instance.removed = True
        instance.save()

        History.new(event=History.DELETE, actor=request.user, object=instance)

        return Response(status=status.HTTP_204_NO_CONTENT)
