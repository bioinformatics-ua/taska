# coding=utf-8
import django_filters
from rest_framework import renderers, serializers, viewsets, permissions, mixins, status
from rest_framework.decorators import api_view, detail_route, list_route
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework import status, filters
from rest_framework import generics

from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework.parsers import BaseParser, FileUploadParser, MultiPartParser

from django.contrib.auth.models import User
from oauth2_provider.ext.rest_framework import TokenHasReadWriteScope, TokenHasScope

from models import *

from django.apps import apps
from django.db import transaction

from history.models import History

from utils.api_related import create_serializer, AliasOrderingFilter

from django.http import HttpResponse
from django.core.servers.basehttp import FileWrapper

import os
from django.core.urlresolvers import reverse, get_resolver

import tempfile
from django.core.files import File as DjangoFile
from django.shortcuts import render
import json

class GenericResourceSerializer(serializers.ModelSerializer):
    '''Serializer to handle :class:`material.models.Resource` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    type = serializers.CharField(write_only=True)

    def to_representation(self, obj):
        ''' Converts str to json for serialization.
        '''
        return obj.to_representation(obj)

    def create(self, data):
        ''' Creates a new resource, by delegating to the several
        Resource Serializer implementations how to do it.
        '''
        serializer = data.pop('serializer')

        return serializer.create(data)

    def update(self, instance, data):
        ''' Updates resource, by delegating to the several
        Resource Serializer implementations how to do it.
        '''
        serializer = data.pop('serializer')

        return serializer.update(instance, data)

    def to_internal_value(self, data):
        ''' Converts json to str for model saving.
        '''
        if data.get('type', False):
            this_model = apps.get_model(data.pop('type'))

            serializer = this_model.init_serializer(partial=True)
            validated = serializer.to_internal_value(data)
            validated['serializer'] = serializer

            return validated

        raise Exception('Found invalid resource type to be processed.')

    class Meta:
        model = Resource

class ResourceCommentSerializer(serializers.ModelSerializer):
    '''Serializer to handle :class:`material.models.ResourceComment` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    user_repr = serializers.SerializerMethodField()

    def get_user_repr(self, obj):
        '''
            Returns a user representation, preferably a full name, but falling by to the
            email if no full name is available.
        '''
        return obj.user.get_full_name() or obj.user.email

    class Meta:
        model = ResourceComment
        exclude = ('id', 'removed')

# Serializers define the API representation.
class ResourceSerializer(serializers.ModelSerializer):
    '''Serializer to handle :class:`material.models.Resource` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    type = serializers.SerializerMethodField()
    creator_repr = serializers.SerializerMethodField()
    #comments = serializers.SerializerMethodField()

    def get_type(self, obj):
        '''
            Returns polymorphically the Resource specific type.
        '''
        return obj.type()

    def get_creator_repr(self, obj):
        '''
            Returns a user representation, preferably a full name, but falling by to the
            email if no full name is available.
        '''
        return obj.creator.get_full_name() or obj.creator.email

    #def get_comments(self, obj):
    #    return ResourceCommentSerializer(obj.resourcecomment_set, many=True).data

    @transaction.atomic
    def create (self, data):
        # this is generically, some custom tasks can override this behaviour
        instance =  self.Meta.model.objects.create(**data)

        return instance

    @transaction.atomic
    def update(self, instance, data):
        for attr, value in data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance

    class Meta:
        model = Resource
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        exclude = ('id', 'removed', 'ttype')
        extra_kwargs = {'hash': {'required': False} }

class FileSerializer(ResourceSerializer):
    '''Serializer to handle :class:`material.models.File` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''

    path = serializers.SerializerMethodField()
    size = serializers.SerializerMethodField()

    def get_path(self, obj):
        '''
            Returns the path where this file is kept
        '''
        baseurl = reverse('resource-detail', kwargs={
                'hash': obj.hash
            })

        return '%sdownload/' % (baseurl)

    def get_size(self, obj):
        '''
            Returns this file size
        '''
        return obj.file.size

    class Meta(ResourceSerializer.Meta):
        model = File
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        extra_kwargs = {'hash': {'required': False}, 'file': {'required': False} }

class ResourceFilter(django_filters.FilterSet):
    '''
        Resource Filter that allows to filter the resource viewset by a variety of fields
        such as `hash`, `create_date`, `latest_update` and `type`.
    '''
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
        return Resource.all(creator=self.request.user)

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

    @detail_route(methods=['get'])
    def download(self, request, hash):
        '''
            Downloads a resource of the type File, if the resource is of other type, no content is returned.
        '''
        # get the file
        servefile = Resource.all().get(hash=hash)

        if servefile and isinstance(servefile, File) and servefile.file:
            name = os.path.basename(servefile.file.name)
            response = HttpResponse(servefile.file)
            response['Content-Disposition'] = 'attachment; filename=%s' % servefile.filename
            return response

        return Response(status=status.HTTP_204_NO_CONTENT)

    @detail_route(methods=['get', 'post'])
    def comment(self, request, hash):
        '''
            Either returns a list of all comments on a given result, when the type of request is get_full_name
            or adds a new comment if the request method is 'post'
        '''
        # get the file
        servefile = Resource.all().get(hash=hash)

        if request.method == 'POST':
            content = request.data.get('comment', None)

            if content:
                comm = {
                    'comment': content,
                    'user': request.user.id,
                    'resource': servefile.id
                }
                #rc = ResourceComment(resource=servefile, user=request.user, comment=content)
                rcs = ResourceCommentSerializer(data=comm)

                if rcs.is_valid(raise_exception=True):
                    rcs.save()

                    History.new(event=History.COMMENT, actor=request.user, object=servefile)

                    return Response({
                        'comment': rcs.data
                        })

            return Response({'error': 'Request must contain a comment'})

        # else if get
        return Response({'comments': ResourceCommentSerializer(servefile.resourcecomment_set, many=True).data})

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

class BinaryParser(BaseParser):
    """
      Binary file parser.
    """
    media_type = 'application/octet-stream'

    def parse(self, stream, media_type=None, parser_context=None):
        """
            Returns a django file object from a stream-like binary object
        """
        tmp = tempfile.NamedTemporaryFile()

        for chunk in iter((lambda:stream.read(2048)),''):
            tmp.write(chunk)

        return DjangoFile(tmp)

class FileUpload(generics.CreateAPIView):
    '''
        GenericView that allows the creation of :class:`material.models.File` objects.

        The file upload is expected to be made with mimetype 'application/octet-stream' the filename should be passed through
        meta request variable HTTP_X_FILE_NAME.

    '''
    queryset = File.objects.none()
    serializer_class = FileSerializer
    lookup_field = 'hash'
    parser_classes = (BinaryParser,)

    def __serializeFile(self, name, creator, this_file):
        '''
            Serializes a file, creating a File object
        '''
        data = {
            'filename': name,
            'type': 'material.File',
            'creator': creator
        }

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        serializer.instance.file = this_file
        serializer.instance.save()

        return serializer.data

    def create(self, request, *args, **kwargs):

        mform = request.FILES
        if len(mform) > 0:
            files = []
            for fd_file in mform.getlist('fd-file'):
                files.append(self.__serializeFile(fd_file.name, request.user.id, fd_file))

            # in case this is a iframe from filedrop with must respond in html with a js function that callsback through window
            return render(request, 'iframe_response.html',
                {
                    "callback": request.POST['fd-callback'],
                    "response": json.dumps(files).replace('"', '\\"')
                },
                content_type="text/html; charset=utf-8"
            )

        else:
            bfile = self.__serializeFile(request.META['HTTP_X_FILE_NAME'], request.user.id, request.data)
            return Response(bfile, status=200)

