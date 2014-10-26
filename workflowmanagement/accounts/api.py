# coding=utf-8
from rest_framework import renderers, serializers, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework import permissions

from django.contrib.auth.models import User

from oauth2_provider.ext.rest_framework import TokenHasReadWriteScope, TokenHasScope

@api_view(('GET',))
def root(request, format=None):
    return Response({
        #'User Listing   ': reverse('user-list', request=request, format=format),
    })


# Serializers define the API representation.
class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        model = User
        fields = ('url', 'username', 'email', 'is_staff')

# ViewSets define the view behavior.
class UserViewSet(viewsets.ModelViewSet):
    """
    This text is the description for this API
    param1 -- A first parameter
    param2 -- A second parameter
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
