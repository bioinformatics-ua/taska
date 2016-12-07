# coding=utf-8

from process.models import *
from rest_framework import serializers, permissions
from oauth2_provider.ext.rest_framework import TokenHasScope

class ProcessTaskUserSerializer(serializers.ModelSerializer):
    '''Serializer to handle :class:`process.models.ProcessTaskUser` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    user_repr = serializers.SerializerMethodField()

    class Meta:
        model = ProcessTaskUser
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        exclude = ('id', 'processtask')
        extra_kwargs = {'hash': {'required': False}}

    def get_user_repr(self, obj):
        '''Returns a textual representation of the user playing the action.

            Preferably the user full name, but falling back to the email in case this does not exist.
        '''
        tmp = unicode(obj.user.get_full_name())

        if not tmp or len(tmp) == 0:
            tmp = obj.user.email

        return tmp

class PTUWithResult(ProcessTaskUserSerializer):
    '''Serializer to handle :class:`process.models.ProcessTaskUser` objects serialization/deserialization.

    This serializer, beside the usual fields, also includes the result, as nested serializer.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    result = serializers.SerializerMethodField()

    def get_result(self, obj):
        result = obj.getResult()
        if result:
            serializer = result.get_serializer()

            return serializer.to_representation(result)

        return None