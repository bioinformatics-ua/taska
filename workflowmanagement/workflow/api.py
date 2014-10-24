# coding=utf-8
from rest_framework import renderers, serializers, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse

from django.contrib.auth.models import User

@api_view(('GET',))
def root(request, format=None):
    return Response({
        #'User Listing   ': reverse('user-list', request=request, format=format),
    })
