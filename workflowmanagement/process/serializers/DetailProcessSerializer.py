# coding=utf-8

from process.models import *
from rest_framework import serializers, permissions
from oauth2_provider.ext.rest_framework import TokenHasScope
from ProcessTaskSerializer import  ProcessTaskSerializer

class DetailProcessSerializer(serializers.ModelSerializer):
    '''Serializer to handle :class:`process.models.Process` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    tasks = ProcessTaskSerializer(many=True)
    workflow = serializers.SlugRelatedField(slug_field='hash', queryset=Workflow.objects)

    class Meta:
        model = Process
        exclude = ('id', 'removed')
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]