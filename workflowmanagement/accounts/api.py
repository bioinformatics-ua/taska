# coding=utf-8
from rest_framework import renderers, serializers, viewsets
from rest_framework.decorators import api_view, detail_route, list_route

from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework import permissions

from django.contrib.auth.models import User

from oauth2_provider.ext.rest_framework import TokenHasReadWriteScope, TokenHasScope

from django.contrib.auth import authenticate, login, logout


@api_view(('GET',))
def root(request, format=None):
    '''
    List available methods over accounts
    '''
    return Response({
        #'User Listing   ': reverse('user-list', request=request, format=format),
    })


# Serializers define the API representation.
class UserSerializer(serializers.ModelSerializer):
    fullname = serializers.SerializerMethodField(required=False)
    last_login = serializers.SerializerMethodField(required=False)

    class Meta:
        permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser, TokenHasScope]
        model = User
        fields = ('url', 'username', 'email', 'is_staff', 'last_login', 'fullname')

    def get_fullname(self, obj):
        tmp = obj.get_full_name()

        if tmp == "":
            return obj.email
        return tmp

    def get_last_login(self, obj):
        return obj.last_login.strftime("%Y-%m-%d %H:%M")

# ViewSets define the view behavior.
class UserViewSet(viewsets.ModelViewSet):
    """
    API for User manipulation

        Note: All methods on this class only work if the user belongs to staff
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    def list(self, request, *args, **kwargs):
        """
        Return a list of users
        """
        return super(UserViewSet, self).list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """
        Insert a new user
        """
        return super(UserViewSet, self).create(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a user, by id
        """
        return super(UserViewSet, self).retrieve(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """
        Update a user, by id
        """
        return super(UserViewSet, self).update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """
        Partial Update a user, by id
        """
        return super(UserViewSet, self).partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        Delete a user, by id
        """
        return super(UserViewSet, self).partial_update(request, *args, **kwargs)

    @list_route(methods=['get'], permission_classes=[permissions.AllowAny])
    def me(self, request):
        """
        Get personal account details
        """
        if request.user.is_authenticated():
            serializer = UserSerializer(instance = request.user, context={'request': request})

            return Response(serializer.data)
        else:
            return Response({'authenticated': False})

    @list_route(methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        """
            Login user
        """
        if not request.user.is_authenticated():
            print request.POST
            username = request.POST.get('username', None)
            password = request.POST.get('password', None)

            if request.POST.get('remember', False):
                request.session.set_expiry(1296000) # if set to remember, keep for 2 weeks


            user = authenticate(username=username, password=password)
            if user is not None:
                if user.is_active:
                    login(request, user)
                else:
                    return Response({
                            'authenticated': False,
                            'error': 'This account is disabled, please contact an administrator'
                        })
            else:
                return Response({
                        'authenticated': False,
                        'error': 'This login username and password are invalid'
                    })

        return Response({'authenticated': True})

    @list_route(methods=['get'])
    def logout(self, request):
        """
            Logout a logged in user
        """
        logout(request)

        return Response({'authenticated': False})
