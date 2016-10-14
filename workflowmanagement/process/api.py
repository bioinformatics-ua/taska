# coding=utf-8

from rest_framework.decorators import api_view, detail_route, list_route
from rest_framework.response import Response



@api_view(('GET',))
def root(request, format=None):
    return Response({
        #'User Listing   ': reverse('user-list', request=request, format=format),
    })
