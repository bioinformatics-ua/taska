# coding=utf-8
from rest_framework import serializers

from rest_framework import permissions

from django.contrib.auth.models import User
from django.db import transaction

from oauth2_provider.ext.rest_framework import TokenHasScope

from django.contrib.auth import login

from accounts.models import Profile

from process.models import ProcessTaskUser

from accounts.serializers.ProfileSerializer import ProfileSerializer

class UserSerializer(serializers.ModelSerializer):
    fullname = serializers.SerializerMethodField(required=False)
    last_login = serializers.SerializerMethodField(required=False)
    have_tasks = serializers.SerializerMethodField(required=False)
    profile = ProfileSerializer()

    class Meta:
        permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser, TokenHasScope]
        model = User
        fields = ('url', 'username', 'first_name', 'last_name', 'email', 'is_staff', 'last_login', 'fullname', 'id', 'profile', 'have_tasks')

    def get_fullname(self, obj):
        '''This method serializes the user name as a textual representation, falling back to the email when not available.
        '''
        tmp = obj.get_full_name()

        if tmp == "":
            return obj.email
        return tmp

    def get_last_login(self, obj):
        '''This method serializes the user last login date as a textual representation.
        '''
        if isinstance(obj.last_login, basestring):
            return obj.last_login
        elif obj.last_login:
            return obj.last_login.strftime("%Y-%m-%d %H:%M")


        return None

    def get_have_tasks(self, obj):
        try:
            ptasks = ProcessTaskUser.all(finished=False, reassigned=False).filter(user=obj)
            if len(ptasks) > 0:
                return True
        except:
            pass #Ignore because I will return false bellow
        return False

    @transaction.atomic
    def create(self, validated_data):
        '''This handles the custom user creation, serializating validated data from the web services input
        into the proper object, plus also inserting profile information, all in the same serialization.
        '''
        profile_data = None

        try:
            profile_data = validated_data.pop('profile')
        except KeyError:
            pass

        user = User.objects.create(**validated_data)

        # create profile data
        if profile_data:
            try:
                p_instance = user.profile
                serializer = ProfileSerializer(p_instance, partial=True)
                serializer.update(p_instance, profile_data)

            except Profile.DoesNotExist:
                Profile.objects.create(user=user, **profile_data)

        return user

    @transaction.atomic
    def update(self, instance, validated_data):
        '''This handles the custom user update, serializating validated data from the web services input
        into the proper object, plus also updating profile information, all in the same serialization.
        '''
        profile_data = None

        try:
            profile_data = validated_data.pop('profile')
        except KeyError:
            pass

        if profile_data:
            p_instance = instance.profile
            serializer = ProfileSerializer(p_instance, partial=True)

            serializer.update(p_instance, profile_data)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance