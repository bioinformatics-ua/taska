from rest_framework import renderers
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse

import workflow
import process
import history
import accounts
import messagesystem

@api_view(('GET',))
def root(request, format=None):

    """
    Lists all listings available directly without parameters in the API
    """
    return Response({
        'workflow': reverse('workflow-list',  request=request, format=format),
        'process':  reverse('process-list',   request=request, format=format),
        'history':  reverse('history-list',   request=request, format=format),
        'accounts': reverse('user-list',  request=request, format=format),
    })
