# coding=utf-8
import django_filters
from process.models import *

class RequestFilter(django_filters.FilterSet):
    process = django_filters.CharFilter(name="processtaskuser__processtask__process__hash")
    task = django_filters.CharFilter(name="processtaskuser__processtask__task__hash")
    user = django_filters.CharFilter(name="processtaskuser__user")

    class Meta:
        model = Request
        fields = ('hash', 'type', 'title', 'message', 'date', 'resolved', 'process', 'task', 'user')