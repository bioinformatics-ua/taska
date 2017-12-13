# coding=utf-8
from rest_framework import serializers

from rest_framework import permissions

from oauth2_provider.ext.rest_framework import TokenHasScope

from accounts.models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    detail_mode_repr = serializers.SerializerMethodField()

    def get_detail_mode_repr(self, obj):
        '''This method serializes the detail_mode as a textual representation.
        '''
        try:
            return dict(Profile.DETAIL_MODES)[obj.detail_mode]
        except KeyError:
            return None

    class Meta:
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        model = Profile
        exclude = ['id', 'user']