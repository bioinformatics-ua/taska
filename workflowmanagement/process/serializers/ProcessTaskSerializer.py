# coding=utf-8

from process.models import *
from rest_framework import serializers, permissions
from oauth2_provider.ext.rest_framework import TokenHasScope
from ProcessTaskUserSerializer import PTUWithResult, ProcessTaskUserSerializer

class ProcessTaskSerializer(serializers.ModelSerializer):
    '''Serializer to handle :class:`process.models.ProcessTask` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    task = serializers.SlugRelatedField(slug_field='hash', queryset=Task.objects)
    task_repr = serializers.SerializerMethodField()

    users =PTUWithResult(many=True, required=False)
    deadline_repr = serializers.SerializerMethodField()

    class Meta:
        model = ProcessTask
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        exclude = ('process', 'removed')
        extra_kwargs = {'hash': {'required': False}}

    def get_deadline_repr(self, obj):
        '''
            Returns a ISO 8601 formatted date representation for this processtask deadline
        '''
        return obj.deadline.strftime("%Y-%m-%dT%H:%M")

    def get_task_repr(self, obj):
        '''
            Returns a textual representation for the task this process task represents
        '''
        return obj.task.title

    @transaction.atomic
    def create(self, validated_data):
        '''
            Handles the creation of ProcessTask entries.

            Returns the created ProcessTask object
        '''
        users_data = None

        try:
            users_data = validated_data.pop('users')
        except KeyError:
            pass

        processtask = ProcessTask.objects.create(**validated_data)

        # create user tasks (if any are passed by this webservice)
        if users_data:
            for user_data in users_data:
                user_data['processtask'] = processtask
                serializer = ProcessTaskUserSerializer()
                print user_data
                ptu = serializer.create(user_data)

        users = []
        auths = processtask.users().order_by('user').distinct('user')

        for ptu in auths:
            users.append(ptu.user)

        History.new(event=History.ADD, actor=processtask.process.executioner, object=processtask, authorized=users, related=[processtask.process])


        return processtask

    @transaction.atomic
    def update(self, instance, validated_data):
        '''
            Handles the update of ProcessTask entries.

            Returns the updated ProcessTask object
        '''
        users_data = None

        try:
            users_data = validated_data.pop('users')
        except KeyError:
            pass

        if users_data:
            for user_data in users_data:
                user_data['processtask'] = instance
                user_serializer = ProcessTaskUserSerializer()

                try:
                    t_instance = ProcessTaskUser.objects.get(processtask=user_data['processtask'])

                    user_serializer.update(t_instance, user_data)

                except (ProcessTaskUser.DoesNotExist, KeyError):
                    ptu=user_serializer.create(user_data)


        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance