# coding=utf-8
import django_filters
from rest_framework import renderers, serializers, viewsets, permissions, mixins, status, filters
from rest_framework.decorators import api_view, detail_route, list_route
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework.exceptions import PermissionDenied

from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Q

from oauth2_provider.ext.rest_framework import TokenHasReadWriteScope, TokenHasScope

from .models import *
from tasks.models import Task, TaskDependency
from tasks.api import GenericTaskSerializer

from history.models import History
from utils.api_related import create_serializer, AliasOrderingFilter

import copy


@api_view(('GET',))
def root(request, format=None):
    return Response({
        #'User Listing   ': reverse('user-list', request=request, format=format),
    })

class WorkflowPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowPermission
        exclude = ('id', 'workflow')
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

# serializers define the API representation.
class WorkflowSerializer(serializers.ModelSerializer):
    permissions = WorkflowPermissionSerializer()
    tasks = GenericTaskSerializer(many=True, required=False)
    assoc_processes = serializers.SerializerMethodField()

    owner_repr = serializers.SerializerMethodField()

    def get_owner_repr(self, obj):
        return obj.owner.get_full_name() or obj.owner.email

    def get_assoc_processes(self, obj):
        return obj.assocProcesses().values_list('hash', flat=True)

    class Meta:
        model = Workflow
        exclude = ('id', 'removed')
        read_only_fields = ('create_date', 'latest_update')
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        extra_kwargs = {'hash': {'required': False}}

    @transaction.atomic
    def create(self, validated_data):
        permissions_data = None
        tasks_data = None

        try:
            permissions_data = validated_data.pop('permissions')
        except KeyError:
            pass

        try:
            tasks_data = validated_data.pop('tasks')
        except KeyError:
            pass

        workflow = Workflow.objects.create(**validated_data)

        # create workflow permissions
        if permissions_data:
            WorkflowPermission.objects.create(workflow=workflow, **permissions_data)

        # create tasks (if any are passed by this webservice)
        if tasks_data:
            for task_data in tasks_data:
                task_serializer = task_data.pop('serializer')
                task_data['workflow'] = workflow
                task_serializer.create(task_data)

        return workflow

    @transaction.atomic
    def update(self, instance, validated_data):
        permissions_data = None
        tasks_data = None

        try:
            permissions_data = validated_data.pop('permissions')
        except KeyError:
            pass

        try:
            tasks_data = validated_data.pop('tasks')
        except KeyError:
            pass

        if permissions_data:
            p_instance = instance.permissions()
            serializer = WorkflowPermissionSerializer(p_instance, partial=True)

            serializer.update(p_instance, permissions_data)

        if tasks_data:
            for task_data in tasks_data:
                task_serializer = task_data.pop('serializer')
                task_data['workflow'] = instance

                try:
                    t_instance = Task.objects.get_subclass(hash=task_data['hash'])

                    task_serializer.update(t_instance, task_data)

                except (Task.DoesNotExist, KeyError):
                    task_serializer.create(task_data)


        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance

class WorkflowDetailSerializer(serializers.ModelSerializer):
    permissions = WorkflowPermissionSerializer()
    tasks = GenericTaskSerializer(many=True)

    assoc_processes = serializers.SerializerMethodField()

    owner_repr = serializers.SerializerMethodField()

    def get_owner_repr(self, obj):
        return obj.owner.get_full_name() or obj.owner.email

    def get_assoc_processes(self, obj):
        return obj.assocProcesses().values_list('hash', flat=True)

    class Meta:
        model = Workflow
        exclude = ('id', 'removed')
        read_only_fields = ('create_date', 'latest_update')
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

class WorkflowFilter(django_filters.FilterSet):
    public = django_filters.BooleanFilter(name="workflowpermission__public")
    searchable = django_filters.BooleanFilter(name="workflowpermission__searchable")
    forkable = django_filters.BooleanFilter(name="workflowpermission__forkable")
    class Meta:
        model = Workflow
        fields = ['owner', 'hash', 'title', 'create_date', 'latest_update', 'public', 'searchable', 'forkable']

# ViewSets define the view behavior.
class WorkflowViewSet(  mixins.CreateModelMixin,
                        mixins.UpdateModelMixin,
                        mixins.ListModelMixin,
                        mixins.RetrieveModelMixin,
                        mixins.DestroyModelMixin,
                        viewsets.GenericViewSet):
    """
    API for Workflow manipulation

        Note: All methods on this class pertain to user owned workflows
    """
    queryset = Workflow.objects.none()
    serializer_class = WorkflowSerializer
    lookup_field = 'hash'

    filter_backends = [filters.DjangoFilterBackend, AliasOrderingFilter]
    filter_class = WorkflowFilter

    ordering_fields = ['owner', 'hash', 'title', 'create_date', 'latest_update', 'public', 'searchable', 'forkable']
    ordering_map = {
        'public': 'workflowpermission__public',
        'searchable': 'workflowpermission__searchable',
        'forkable': 'workflowpermission__forkable',
        'owner_repr': 'owner__id'
    }
    # we must override queryset to filter by authenticated user
    def get_queryset(self):
        return Workflow.all(user=self.request.user)

    def list(self, request, *args, **kwargs):
        """
        Return a list of user-owned workflows

        """
        return super(WorkflowViewSet, self).list(request, args, kwargs)


    def __linkTasks(self, data, workflow):
        map = {}
        pstates = []
        old = copy.deepcopy(data)

        assoc_count = len(workflow.assocProcesses())

        if data.get('tasks', False):
            for task in data['tasks']:
                task.pop('dependencies', None)

                t = None
                if task.get('hash', False):
                    try:
                        t = Task.objects.get(hash=task['hash'])
                    except Task.DoesNotExist:
                        pass

                if t:
                    print "updating"
                    print task
                    ts = GenericTaskSerializer(t, data=task)
                else:
                    if assoc_count > 0:
                        raise Exception("Can't update an workflow schema when there are processes that ran with it. Please fork the workflow to create a new version of the workflow schema.")

                    print "creating"
                    task['workflow'] = workflow.id
                    print task
                    ts = GenericTaskSerializer(data=task)

                valid = ts.is_valid(raise_exception=True)

                if valid:
                    t = ts.save()
                else:
                    print "--ERRORS FOUND ON TASK"

                map[task['sid']] = t.hash
                pstates.append(t.hash)

            for task in old['tasks']:
                task['hash'] = map[task['sid']];
                if task.get('dependencies', False):
                    for dep in task['dependencies']:
                        dep['dependency'] = map[dep['dependency']]


            deleted_tasks = workflow.tasks().exclude(hash__in=pstates)

            for task in deleted_tasks:
                if assoc_count > 0:
                    raise Exception("Can't update an workflow schema when there are processes that ran with it. Please fork the workflow to create a new version of the workflow schema.")
                task.remove()



        return old

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Insert a new workflow

        """
        request.data[u'owner'] = request.user.id

        d = copy.deepcopy(request.data)

        request.data.pop('tasks')
        # first round without tasks, to get reference to workflow instance
        serializer, headers = create_serializer(self, request)

        # create tasks...
        wf = serializer.save()

        d = self.__linkTasks(d, wf)

        print d

        serializer = WorkflowSerializer(instance=wf, data=d, partial=True)
        serializer.is_valid(raise_exception=True)
        # add tasks dependencies
        serializer.save()

        History.new(event=History.ADD, actor=request.user, object=serializer.instance)

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """
        Update a existing workflow
        """

        instance = self.get_object()


        if instance.owner != request.user:
            raise PermissionDenied
        # create tasks if they dont exist, and replace links... i couldnt think of a better way to do this...
        # without implicating several connections. or this
        d = self.__linkTasks(request.data.copy(), instance)

        serializer = WorkflowSerializer(instance=instance, data=d, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        History.new(event=History.EDIT, actor=request.user, object=instance)

        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a workflow, by id including related tasks

        """
        History.new(event=History.ACCESS, actor=request.user, object=self.get_object())

        return Response(WorkflowDetailSerializer(self.get_object()).data)
        #return super(WorkflowViewSet, self).retrieve(request, args, kwargs)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        """
        Delete a workflow, by id

        """
        instance = self.get_object()

        instance.removed = True
        instance.save()

        History.new(event=History.DELETE, actor=request.user, object=instance)

        return Response(status=status.HTTP_204_NO_CONTENT)

    @detail_route(methods=['get'])
    def fork(self, request, hash=None):
        """
        Duplicates a public or owned workflow, returning the duplicate
        """
        workflow = self.get_object()

        if workflow.permissions().forkable:
            new_workflow = workflow.fork(owner=request.user)

            History.new(event=History.ADD, actor=request.user, object=new_workflow)

            return Response(WorkflowSerializer(new_workflow).data)

        return Response({"error": "Workflow isn't forkable"}, 403)
