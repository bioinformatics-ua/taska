# coding=utf-8
import django_filters
from process.models import *

class ProcessFilter(django_filters.FilterSet):
    '''
        Process Filter that allows to filter the process viewset by a variety of fields
        such as `workflow`, `hash`, `start_date`, `end_date` ,`status` and `executioner`.
    '''
    class Meta:
        model = Process
        fields = ['workflow', 'hash', 'start_date', 'end_date', 'status', 'executioner']