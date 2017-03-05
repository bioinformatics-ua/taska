# coding=utf-8

from process.models import *
from process.serializers.ProcessTaskSerializer import  ProcessTaskSerializer
from process.serializers.ProcessSerializer import  ProcessSerializer
from process.filters.ProcessFilter import  ProcessFilter

from rest_framework.decorators import detail_route
from rest_framework import viewsets, mixins, status, filters
from rest_framework.response import Response

from utils.api_related import create_serializer, AliasOrderingFilter

from django.shortcuts import get_object_or_404
from django.http import Http404

class ProcessViewSet(mixins.CreateModelMixin,
                     mixins.UpdateModelMixin,
                     mixins.ListModelMixin,
                     mixins.RetrieveModelMixin,
                     mixins.DestroyModelMixin,
                     viewsets.GenericViewSet):
    """
    API for Process manipulation

        Note: All methods on this class pertain to user owned processes
    """


    queryset = Process.objects.none()
    serializer_class = ProcessSerializer
    lookup_field = 'hash'

    filter_backends = [filters.DjangoFilterBackend, AliasOrderingFilter]
    filter_class = ProcessFilter
    ordering_map = {
        'object_repr': 'workflow__title'
    }

    ordering_fields = ('workflow', 'hash', 'start_date', 'end_date', 'status', 'executioner', 'object_repr')
    #paginate_by = 5
    #paginate_by_param = 'page_size'
    #max_paginate_by = 100

    def get_queryset(self):
        return Process.all().filter(
            ~Q(status=Process.FINISHED) & ~Q(status=Process.CANCELED),
            Q(processtask__processtaskuser__user=self.request.user) | Q(executioner=self.request.user),
        ).distinct().order_by('start_date')


    def list(self, request, *args, **kwargs):
        """
        Return a list of user-owned processes

        """
        return super(ProcessViewSet, self).list(request, args, kwargs)


    def create(self, request, *args, **kwargs):
        """
        Insert a new process

        """
        request.data[u'executioner'] = request.user.id

        serializer, headers = create_serializer(self, request)

        History.new(event=History.ADD, actor=request.user, object=serializer.instance)

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


    def update(self, request, *args, **kwargs):
        """
        Update an already existing process

        """
        request.data[u'executioner'] = request.user.id

        instance = self.get_object()

        serializer = ProcessSerializer(instance=instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        History.new(event=History.EDIT, actor=request.user, object=instance)

        return Response(serializer.data)


    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a process, by id

        """
        instance = self.get_object()

        History.new(event=History.ACCESS, actor=request.user, object=instance)

        return Response(ProcessSerializer(instance).data)

    def get_object(self):
        """
        Overrided
        """
        obj = None
        try:
            obj = Process.objects.get(
                hash=self.kwargs['hash']
            )
        except Process.DoesNotExist:
            pass
        print obj
        if obj == None:
            raise Http404('No object')

        self.check_object_permissions(self.request, obj)
        return obj


    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        """
        Logical delete a process, by id
        """
        instance = self.get_object()

        instance.removed = True
        instance.save()

        instance.cancel()

        History.new(event=History.DELETE, actor=request.user, object=instance)

        return Response(status=status.HTTP_204_NO_CONTENT)


    @detail_route(methods=['get'])
    def cancel(self, request, hash=None):
        """
        Cancel a process, marking all current executing and waiting tasks as canceled.
        """
        process = self.get_object()
        process.cancel()

        History.new(event=History.CANCEL, actor=request.user, object=process)

        return Response(ProcessSerializer(process).data)


    @detail_route(methods=['post'])
    def adduser(self, request, hash=None):
        """
        Add a new user to a process, for a task that is either executing or waiting execution.
        """
        process = self.get_object()

        ptask = None
        user = None
        try:
            ptask = ProcessTask.all(process=process).get(hash=request.data['ptask'])
        except:
            pass

        try:
            user = User.objects.get(id=request.data['user'])
        except:
            pass

        if ptask and user:
            try:
                ptaskuser = ProcessTaskUser.objects \
                    .get(processtask=ptask,
                         user=user
                         )


            except ProcessTaskUser.DoesNotExist:
                ptaskuser = ProcessTaskUser(user=user, processtask=ptask)
                ptaskuser.status = ProcessTaskUser.RUNNING
                ptaskuser.save()

                History.new(event=History.ADD, actor=ptask.process.executioner, object=ptask, authorized=[ptaskuser.user],
                            related=[ptask.process])

                return Response(ProcessSerializer(process).data)

        return Response(status=status.HTTP_400_BAD_REQUEST)


    @detail_route(methods=['post'])
    def changedeadline(self, request, hash=None):
        """
        Change the deadline for a process task conclusion
        """
        process = self.get_object()

        ptask = None
        deadline = request.data.get('deadline', None)
        try:
            ptask = ProcessTask.all(process=process).get(hash=request.data.get('ptask', None))
        except:
            pass

        if ptask and deadline:
            pt = ProcessTaskSerializer(ptask, data={'deadline': deadline}, partial=True)

            pt.is_valid(raise_exception=True)
            pt.save()

            users = [process.executioner]
            auths = ptask.users().order_by('user').distinct('user')

            for ptu in auths:
                if ptu.user != process.executioner:
                    users.append(ptu.user)

            History.new(event=History.EDIT, actor=process.executioner,
                        object=ptask, authorized=users, related=[process])

            return Response(ProcessSerializer(process).data)

        return Response({'error': 'unknown'}, status=status.HTTP_400_BAD_REQUEST)


    @detail_route(methods=['post'])
    def canceluser(self, request, hash=None):
        """
        Cancel a specific user task on a process task.
        """
        try:
            ptask = ProcessTaskUser.objects \
                .get(processtask__hash=request.data['ptask'],
                     user__id=request.data['user']
                     )

            if request.data['val'] == True:
                ptask.reassign(request.data['cancelTask'])
            else:
                ptask.assign()

        except ProcessTaskUser.DoesNotExist, KeyError:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        return Response(ProcessSerializer(self.get_object()).data)

    @detail_route(methods=['post'])
    def canceltask(self, request, hash=None):
        """
        Cancel all users task on a process task.
        """
        try:
            ptusers = ProcessTaskUser.all().filter(processtask__hash=request.data['ptask'])
            #Cancel all users
            for ptuser in ptusers:
                ptuser.reassign()

            #Cancel again the first with the incidation to cancel the task too
            ptusers[0].reassign(True)

        except ProcessTaskUser.DoesNotExist, KeyError:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        return Response(ProcessSerializer(self.get_object()).data)

    @detail_route(methods=['post'])
    def refine(self, request, hash=None):
        """
            Reverts a specific user task on a process task.
        """

        ptu = get_object_or_404(ProcessTaskUser, hash=request.data['ptu'])

        ptu.finished = False
        ptu.status = ProcessTaskUser.IMPROVING
        ptu.save()

        ptask = ptu.processtask

        ptask.status = ProcessTask.RUNNING

        ptask.save()

        ptask.process.status = Process.RUNNING

        ptask.process.save()

        return Response(ProcessSerializer(self.get_object()).data)


    @detail_route(methods=['post'])
    def startProcess(self, request, hash=None):
        try:
            obj = Process.all().filter(
                hash=hash
            )
            obj[0].start()
        except ProcessTaskUser.DoesNotExist:
            raise Http404

        process = self.get_object()
        return Response(ProcessSerializer(process).data)


    @detail_route(methods=['get'])
    def validateAcceptions(self, request, hash=None):
        try:
            obj = Process.all().filter(
                hash=hash
            )
            if (obj[0].validateAcceptions()):
                return Response({"valid": True})
        except ProcessTaskUser.DoesNotExist:
            raise Http404

        return Response({"valid": False})


    @detail_route(methods=['post'])
    def reassignRejectedUser(self, request, hash=None):
        '''
        Receive the hash of the task because the resign is done in the taskSimple, but we want resign in all
        process, so the service is implemented in this class
         '''
        ptask_hash = request.data.get('hash', None)

        if request.data.get('allTasks', None) == True:
            try:
                obj = Process.all().filter(
                    hash=hash
                )
                obj[0].resignRejectedUser(request.data.get('oldUser', None), request.data.get('newUser', None))
            except ProcessTaskUser.DoesNotExist:
                raise Http404
        else:
            try:
                obj = ProcessTask.all().filter(
                    hash=ptask_hash
                )
                obj[0].resignRejectedUser(request.data.get('oldUser', None), request.data.get('newUser', None))
            except ProcessTaskUser.DoesNotExist:
                raise Http404
        process = self.get_object()

        return Response(ProcessSerializer(process).data)