from rest_framework import renderers
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse

import workflow
import process
import history
import accounts

@api_view(('GET',))
def root(request, format=None):

    """
    This text is the description for this API
    param1 -- A first parameter
    param2 -- A second parameter
    """
    return Response({
        'workflow': reverse(workflow.api.root,  request=request, format=format),
        'process':  reverse(process.api.root,   request=request, format=format),
        'history':  reverse(history.api.root,   request=request, format=format),
        'accounts': reverse(accounts.api.root,  request=request, format=format),
    })
