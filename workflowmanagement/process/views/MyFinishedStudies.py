# coding=utf-8

from process.models import *
from process.serializers.ProcessSerializer import  ProcessSerializer
from process.filters.ProcessFilter import ProcessFilter

from rest_framework import viewsets, mixins, filters, status, generics
from rest_framework.response import Response

from utils.api_related import AliasOrderingFilter

class MyFinishedStudies(mixins.ListModelMixin,
                        mixins.RetrieveModelMixin,
                        mixins.DestroyModelMixin,
                        viewsets.GenericViewSet):
    """
        Returns a list of user attributed process tasks across all processes
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

    def get_queryset(self):
        allProcess = Process.all().filter(
            Q(status=Process.FINISHED) | Q(status=Process.CANCELED),
            Q(processtask__processtaskuser__user=self.request.user) | Q(executioner=self.request.user),
            processtask__processtaskuser__reassigned = False
        ).distinct().order_by('end_date')

        return allProcess

    def list(self, request, *args, **kwargs):
        """
        Return a list of user-owned processes

        """
        return super(MyFinishedStudies, self).list(request, args, kwargs)

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