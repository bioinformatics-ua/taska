# coding=utf-8
from rest_framework import renderers, serializers, viewsets, filters
from rest_framework.decorators import api_view, detail_route, list_route

from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework import permissions

from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Q

from oauth2_provider.ext.rest_framework import TokenHasReadWriteScope, TokenHasScope

from django.contrib.auth import authenticate, login, logout

from models import Profile, UserRecovery

from history.models import History
from process.models import ProcessTaskUser

from django.utils import timezone

@api_view(('GET',))
def root(request, format=None):
    '''
    List available methods over accounts
    '''
    return Response({
        #'User Listing   ': reverse('user-list', request=request, format=format),
    })
