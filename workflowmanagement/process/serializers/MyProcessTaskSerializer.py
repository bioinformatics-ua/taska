# coding=utf-8

from process.models import *
from rest_framework import serializers, permissions
from oauth2_provider.ext.rest_framework import TokenHasScope
from tasks.api import GenericTaskSerializer

class MyProcessTaskSerializer(serializers.ModelSerializer):
    '''Serializer to handle :class:`process.models.ProcessTask` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    type = serializers.SerializerMethodField()
    process = serializers.SerializerMethodField()
    process_repr = serializers.SerializerMethodField()
    parent = serializers.SerializerMethodField()
    task = serializers.SlugRelatedField(slug_field='hash', queryset=Task.objects)

    deadline_repr = serializers.SerializerMethodField()

    def get_deadline_repr(self, obj):
        return obj.deadline.strftime("%Y-%m-%dT%H:%M")

    def get_type(self, obj):
        return Task.objects.get_subclass(id=obj.task.id).type()

    def get_process(self, obj):
        return obj.process.hash

    def get_process_repr(self, obj):
        return obj.process.__unicode__()

    def get_parent(self, obj):
        return GenericTaskSerializer(Task.objects.get_subclass(id=obj.task.id)).data

    class Meta:
        model = ProcessTask
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        exclude = ('process', 'removed')
        extra_kwargs = {'hash': {'required': False}}