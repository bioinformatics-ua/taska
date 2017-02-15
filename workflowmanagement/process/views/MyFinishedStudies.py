# coding=utf-8

from process.models import *
from process.serializers.ProcessSerializer import  ProcessSerializer
from process.filters.ProcessFilter import ProcessFilter

from rest_framework import filters, generics

from utils.api_related import AliasOrderingFilter

class MyFinishedStudies(generics.ListAPIView):
    """
        Returns a list of user attributed process tasks across all processes
    """

    queryset = Process.objects.none()
    serializer_class = ProcessSerializer


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