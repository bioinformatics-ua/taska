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

from material.api import GenericResourceSerializer

from process.api import MyProcessTaskUserDetailSerializer

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
        model = Result


# Serializers define the API representation.
class ResultSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    process = serializers.CharField(max_length=50)
    task = serializers.CharField(max_length=50)
    user = serializers.IntegerField()
    user_repr = serializers.SerializerMethodField()
    outputs = serializers.SerializerMethodField()
    outputswrite = serializers.ListField(child=serializers.CharField(), write_only=True)
    processtaskuser = serializers.SlugRelatedField(slug_field='hash', queryset=ProcessTaskUser.objects)
    process_owner = serializers.SerializerMethodField()

    def get_outputs(self, obj):
        serializer = GenericResourceSerializer(
                obj.outputs.all().select_subclasses(),
                many=True
            )
        return serializer.data


    def get_process_owner(self, obj):
        return obj.processtaskuser.processtask.process.executioner.id

    def get_user_repr(self, obj):
        return obj.processtaskuser.user.get_full_name()

    class Meta:
        model = Result
        exclude = ('id', 'removed')
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        extra_kwargs = {
            'hash': {'required': False},
            'outputs': {'read_only': True}
        }

    def get_type(self, obj):
        return obj.type()

    def __create_resources(self, result, resources):
        if resources != None:
            old_resources = result.outputs.exclude(hash__in=resources).select_subclasses()

            for old in old_resources:
                # mark the resource as removed
                old.remove()
                result.outputs.remove(old)


            for resource in resources:
                try:
                    r = Resource.objects.get(hash=resource)
                    r.link()
                    result.outputs.add(r)
                    result.save()
                except Resource.DoesNotExist:
                    print "-- ERROR: Couldnt add resource to result"

    @transaction.atomic
    def create(self, validated_data):
        process = validated_data.pop('process')
        task    = validated_data.pop('task')
        user    = validated_data.pop('user')
        outputs = validated_data.pop('outputswrite', None)

        this_ptu     = None
        try:
            process = Process.objects.get(hash=process)
            task = Task.objects.get(hash=task)

            this_ptu = ProcessTaskUser.objects.get(
                    processtask__process=process,
                    processtask__task=task,
                    user__id=user
                )
            this_ptu.finish()

            validated_data[u'processtaskuser'] = this_ptu
        except (Process.DoesNotExist, Task.DoesNotExist, ProcessTaskUser.DoesNotExist):
            return None


        result = self.Meta.model.objects.create(**validated_data)

        users = []
        auths = this_ptu.processtask.users().order_by('user').distinct('user')

        for ptu in auths:
            users.append(ptu.user)

        users.append(process.executioner)

        History.new(event=History.ADD, actor=this_ptu.user, object=result, authorized=users)

        self.__create_resources(result, outputs)

        return result

    @transaction.atomic
    def update(self, instance, data):
        ptu = data.pop('processtaskuser', None)
        process = data.pop('process')
        task    = data.pop('task')
        user    = data.pop('user')
        outputs = data.pop('outputswrite', None)

        for attr, value in data.items():
            setattr(instance, attr, value)

        instance.save()

        self.__create_resources(instance, outputs)

        return instance

class SimpleResultSerializer(ResultSerializer):
    class Meta(ResultSerializer.Meta):
        model = SimpleResult
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
    queryset = Result.objects.none()
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

        #History.new(event=History.ADD, actor=request.user, object=serializer.instance)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """
        Update an already existing result

        """
        request.data[u'user'] = request.user.id

        instance = self.get_object()

        serializer = instance.init_serializer(instance=instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        #History.new(event=History.EDIT, actor=request.user, object=instance)

        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a result, by id

        """
        instance = self.get_object()
        History.new(event=History.ACCESS, actor=request.user, object=instance)

        return super(ResultViewSet, self).retrieve(request, args, kwargs)

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

