# coding=utf-8
import django_filters
from rest_framework import renderers, serializers, viewsets, permissions, mixins
from rest_framework.decorators import api_view, detail_route, list_route
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework import status, filters

from django.contrib.auth.models import User
from django.db import transaction
from oauth2_provider.ext.rest_framework import TokenHasReadWriteScope, TokenHasScope

from result.models import *

from utils.api_related import create_serializer, AliasOrderingFilter

from process.models import Process, ProcessTaskUser
from tasks.models import Task
from history.models import History

from django.apps import apps

class GenericResultSerializer(serializers.ModelSerializer):
    type = serializers.CharField(write_only=True)

    def to_representation(self, obj):
        return obj.to_representation(obj)

    def create(self, data):
        serializer = data.pop('serializer')

        return serializer.create(data)

    def update(self, instance, validated_attrs):
        print "UPDATING"
        print instance
        print validated_attrs
        print "..."
        pass

    def to_internal_value(self, data):
        if(data['type'] != None):
            this_model = apps.get_model(data.pop('type'))

            serializer = this_model.init_serializer(partial=True)
            validated = serializer.to_internal_value(data)
            validated['serializer'] = serializer

            return validated

        raise Exception('Found invalid task type to be processed.')

    # override to suport
    #def to_internal_value(self, data):
    #    return obj.to_internal_value(obj)

    #def create(self, validated_data):
    #    return HighScore.objects.create(**validated_data)
    class Meta:
        model = Task

# Serializers define the API representation.
class ResultSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    process = serializers.CharField(max_length=50)
    task = serializers.CharField(max_length=50)
    user = serializers.IntegerField()

    class Meta:
        model = Result
        exclude = ('id', 'processtaskuser', 'removed')
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        extra_kwargs = {'hash': {'required': False}}

    def get_type(self, obj):
        return obj.type()

    @transaction.atomic
    def create(self, validated_data):
        process = validated_data.pop('process')
        task    = validated_data.pop('task')
        user    = validated_data.pop('user')

        try:
            process = Process.objects.get(hash=process)
            task = Task.objects.get(hash=task)

            validated_data[u'processtaskuser'] =  ProcessTaskUser.objects.get(
                    processtask__process=process,
                    processtask__task=task,
                    user__id=user
                )
        except (Process.DoesNotExist, Task.DoesNotExist, ProcessTaskUser.DoesNotExist):
            return None


        result = self.Meta.model.objects.create(**validated_data)

        return result

class SimpleResultSerializer(ResultSerializer):
    class Meta:
        model = SimpleResult
        #exclude = ('workflow',)
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        read_only_fields = ('workflow',)

class ResultFilter(django_filters.FilterSet):
    process = django_filters.CharFilter(name="processtaskuser__processtask__process__hash")
    task = django_filters.CharFilter(name="processtaskuser__processtask__task__hash")
    class Meta:
        model = Result
        fields = ['processtaskuser', 'date', 'comment', 'hash', 'process', 'task']

# ViewSets define the view behavior.
class ResultViewSet(    mixins.CreateModelMixin,
                        mixins.UpdateModelMixin,
                        mixins.ListModelMixin,
                        mixins.RetrieveModelMixin,
                        mixins.DestroyModelMixin,
                        viewsets.GenericViewSet):
    """
    API for Result manipulation

    """
    queryset = Result.objects.all()
    serializer_class = GenericResultSerializer
    lookup_field= 'hash'

    filter_backends = [ filters.DjangoFilterBackend, AliasOrderingFilter]
    filter_class = ResultFilter

    ordering_fields = ('date', 'comment', 'hash', 'process', 'task')
    ordering_map = {
        'process': 'processtaskuser__processtask__process__hash',
        'task': 'processtaskuser__processtask__task__hash'
    }

    def get_queryset(self):
        """
        This view should return only owned process related results
        """
        user = self.request.user
        return Result.all(owner=user)

    def list(self, request, *args, **kwargs):
        """
        Return a list of results all over the system

        """
        return super(ResultViewSet, self).list(request, args, kwargs)

    def create(self, request, *args, **kwargs):
        """
        Insert a new result

        """
        request.data[u'user'] = request.user.id

        serializer, headers = create_serializer(self, request)

        History.new(event=History.ADD, actor=request.user, object=serializer.instance)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """
        Update an already existing result

        """
        request.data[u'user'] = request.user.id

        instance = self.get_object()

        serializer = instance.init_serializer(instance=instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        History.new(event=History.EDIT, actor=request.user, object=instance)

        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a result, by id

        """
        instance = self.get_object()
        History.new(event=History.ACCESS, actor=request.user, object=instance)

        return Response(ResultSerializer(instance).data)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        """
        Delete a result, by id
        """
        instance = self.get_object()

        instance.removed = True
        instance.save()

        History.new(event=History.DELETE, actor=request.user, object=instance)

        return Response(status=status.HTTP_204_NO_CONTENT)

