# coding=utf-8
from rest_framework import renderers, serializers, viewsets, permissions, mixins
from rest_framework.decorators import api_view, detail_route, list_route
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework import status

from django.contrib.auth.models import User
from django.db import transaction
from oauth2_provider.ext.rest_framework import TokenHasReadWriteScope, TokenHasScope

from process.models import Process, ProcessTask, ProcessTaskUser

from history.models import History

from workflow.models import Workflow
from tasks.models import Task

from utils.api_related import create_serializer

@api_view(('GET',))
def root(request, format=None):
    return Response({
        #'User Listing   ': reverse('user-list', request=request, format=format),
    })

class ProcessTaskUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessTaskUser
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        exclude = ('id', 'processtask')

class ProcessTaskSerializer(serializers.ModelSerializer):
    task = serializers.SlugRelatedField(slug_field='hash', queryset=Task.objects)
    users = ProcessTaskUserSerializer(many=True, required=False)

    class Meta:
        model = ProcessTask
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        exclude = ('id', 'process', 'removed')

    @transaction.atomic
    def create(self, validated_data):
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

                serializer.create(user_data)

        return processtask

# Serializers define the API representation.
class ProcessSerializer(serializers.ModelSerializer):
    tasks = ProcessTaskSerializer(many=True, required=False)
    workflow = serializers.SlugRelatedField(slug_field='hash', queryset=Workflow.objects)
    class Meta:
        model = Process
        exclude = ('id', 'removed')
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        extra_kwargs = {'hash': {'required': False}}

    @transaction.atomic
    def create(self, validated_data):
        tasks_data = None

        try:
            tasks_data = validated_data.pop('tasks')
        except KeyError:
            pass

        process = Process.objects.create(**validated_data)

        # create tasks (if any are passed by this webservice)
        if tasks_data:
            for task_data in tasks_data:
                task_data['process'] = process
                serializer = ProcessTaskSerializer()

                serializer.create(task_data)

        return process

class DetailProcessSerializer(serializers.ModelSerializer):
    tasks = ProcessTaskSerializer(many=True)

    class Meta:
        model = Process
        exclude = ('id', 'removed')
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

# ViewSets define the view behavior.
class ProcessViewSet(  mixins.CreateModelMixin,
                        mixins.ListModelMixin,
                        mixins.RetrieveModelMixin,
                        mixins.DestroyModelMixin,
                        viewsets.GenericViewSet):
    """
    API for Process manipulation

        Note: All methods on this class pertain to user owned processes
    """
    queryset = Process.all()
    serializer_class = ProcessSerializer
    lookup_field = 'hash'

    def list(self, request, *args, **kwargs):
        """
        Return a list of user-owned processes

        """
        return super(ProcessViewSet, self).list(request, args, kwargs)


    def create(self, request, *args, **kwargs):
        """
        Insert/Update a new process

        """
        request.data[u'executioner'] = request.user.id

        serializer, headers = create_serializer(self, request)

        History.new(event=History.ADD, actor=request.user, object=serializer.instance)

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a process, by id

        """
        instance = self.get_object()
        History.new(event=History.ACCESS, actor=request.user, object=instance)

        return Response(DetailProcessSerializer(instance)).data

    def destroy(self, request, *args, **kwargs):
        """
        Delete a process, by id

        TODO: Implement
        """
        return Response({})

    @list_route(methods=['get'])
    def requests(self, request):
        """
        Show user-attributed requests, related with owned processes
        Request can be of several types, such as Clarification, or reassignment

        TODO: Implement
        """
        return Response({})
