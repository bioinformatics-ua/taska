# coding=utf-8

from process.models import *
from rest_framework import serializers, permissions
from oauth2_provider.ext.rest_framework import TokenHasScope
from ProcessTaskSerializer import  ProcessTaskSerializer

class ProcessSerializer(serializers.ModelSerializer):
    '''Serializer to handle :class:`process.models.Process` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    tasks = ProcessTaskSerializer(many=True, required=False)
    workflow = serializers.SlugRelatedField(slug_field='hash', queryset=Workflow.objects)
    start_date = serializers.SerializerMethodField()
    object_repr = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    status_repr = serializers.SerializerMethodField()
    owner = serializers.SerializerMethodField()

    class Meta:
        model = Process
        exclude = ('id', 'removed')
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        extra_kwargs = {'hash': {'required': False}}

    def get_owner(self, obj):
        try:
            if self.context['request'].user == obj.executioner:
                return True
        except:
            pass #Not important to solve because sometimes the process don't have owner
        return False

    def get_progress(self, obj):
        '''
            Returns the process completion percentage, calculated from completed tasks
        '''
        return obj.progress()

    def get_start_date(self, obj):
        '''
            Returns a ISO 8601 formatted date representation for this process start date
        '''
        return obj.start_date.strftime("%Y-%m-%d %H:%M")

    def get_object_repr(self, obj):
        '''
            Returns a textual representation of this Process workflow
        '''
        return unicode(obj.workflow)

    def get_status_repr(self, obj):
        '''
            Returns a textual representation of this process current status
        '''
        return Process.statusCode(obj.status)

    @transaction.atomic
    def create(self, validated_data):
        '''
            Handles the creation of Process entries.

            Returns the created Process object
        '''
        tasks_data = None
        try:
            tasks_data = validated_data.pop('tasks')
        except KeyError:
            pass

        process = Process.objects.create(**validated_data)

        # create tasks (if any are passed by this webservice)
        if tasks_data:
            for task_data in tasks_data:
                if process.status == Process.WAITING:
                    task_data['status'] = ProcessTask.WAITING_AVAILABILITY

                task_data['process'] = process
                serializer = ProcessTaskSerializer()

                serializer.create(task_data)

        # This will start non-dependant tasks immediately
        process.move()

        return process

    @transaction.atomic
    def update(self, instance, validated_data):
        '''
            Handles the update of Process entries.

            Returns the updated Process object
        '''
        tasks_data = None

        try:
            tasks_data = validated_data.pop('tasks')
        except KeyError:
            pass

        if tasks_data:
            for task_data in tasks_data:
                task_data['process'] = instance
                task_serializer = ProcessTaskSerializer()

                try:
                    t_instance = ProcessTask.objects.get(task=task_data['task'], process=task_data['process'])

                    task_serializer.update(t_instance, task_data)

                except (ProcessTask.DoesNotExist, KeyError):
                    task_serializer.create(task_data)


        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance