# coding=utf-8

from process.models import *
from rest_framework import serializers, permissions
from oauth2_provider.ext.rest_framework import TokenHasScope
from ProcessTaskUserSerializer import ProcessTaskUserSerializer
from rest_framework.response import Response

class RequestResponseSerializer(serializers.ModelSerializer):
    status_repr = serializers.SerializerMethodField()
    public = serializers.BooleanField(write_only=True)

    class Meta:
        model = RequestResponse
        exclude = ['id']
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

    def get_status_repr(self, obj):
        return dict(Request.TYPES)[obj.status]

class RequestSerializer(serializers.ModelSerializer):
    processtaskuser = ProcessTaskUserSerializer(read_only=True)
    process = serializers.CharField(max_length=50)
    process_repr = serializers.SerializerMethodField()
    process_owner = serializers.SerializerMethodField()
    task = serializers.CharField(max_length=50)
    user = serializers.IntegerField(write_only=True)
    date = serializers.SerializerMethodField()
    type_repr = serializers.SerializerMethodField()
    response = RequestResponseSerializer(required=False)

    def get_date(self, obj):
        return obj.date.strftime("%Y-%m-%d %H:%M")

    def get_type_repr(self, obj):
        return dict(Request.TYPES)[obj.type]

    def get_process_owner(self, obj):
        return obj.processtaskuser.processtask.process.executioner.id

    def get_process_repr(self, obj):
        return str(obj.processtaskuser.processtask.process)

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
        except Process.DoesNotExist:
            return Response({'error': 'Process %s not found' %(request.data['process'])}, status=404)

        except Task.DoesNotExist:
            return Response({'error': 'Task %s not found' %(request.data['task'])}, status=404)

        except ProcessTaskUser.DoesNotExist:
            return Response({'error': 'User %f is not performing task %s' %(request.user, request.data['task'])}, status=404)


        response = validated_data.pop('response', None)

        request = Request.objects.create(**validated_data)

        rserializer = None
        if response:
            response['request'] = request.id

            make_public = response.pop('public', False)

            rserializer = RequestResponseSerializer(data=response)

            rserializer.is_valid()

            rserializer.save()

            request.public = make_public
            request.save()

        if rserializer:
            request.resolve()

        return request

    @transaction.atomic
    def update(self, instance, validated_data):
        tasks_data = None

        try:
            process = validated_data.pop('process')
            task    = validated_data.pop('task')
            user    = validated_data.pop('user')
            processtaskuser = validated_data.pop('processtaskuser')
        except KeyError:
            pass

        response = validated_data.pop('response', None)
        rserializer = None
        if response:
            rep = None
            try:
                rep = instance.response
            except RequestResponse.DoesNotExist:
                rep = RequestResponse(request=instance)
                rep.save()

            make_public = response.get('public', False)

            try:
                rserializer = RequestResponseSerializer(
                    instance=rep,
                    data=response,
                    partial=True
                )
            except RequestResponse.DoesNotExist:
                rserializer = RequestResponseSerializer(data=response)

            rserializer.is_valid(raise_exception=True)

            rserializer.save()

            instance.public = make_public

            instance.resolve()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance

    class Meta:
        model = Request
        exclude = ('id', 'removed')
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        extra_kwargs = {
            'hash': {'required': False}
        }

class SimpleRequestSerializer(RequestSerializer):
    class Meta(RequestSerializer.Meta):
        exclude = ('id', 'removed', 'processtaskuser')
