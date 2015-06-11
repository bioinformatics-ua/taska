# coding=utf-8
from rest_framework import renderers, serializers, viewsets
from rest_framework.decorators import api_view, detail_route, list_route

from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework import permissions

from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Q

from oauth2_provider.ext.rest_framework import TokenHasReadWriteScope, TokenHasScope

from django.contrib.auth import authenticate, login, logout

from models import Profile

from history.models import History

@api_view(('GET',))
def root(request, format=None):
    '''
    List available methods over accounts
    '''
    return Response({
        #'User Listing   ': reverse('user-list', request=request, format=format),
    })

# Serializers user profile
class ProfileSerializer(serializers.ModelSerializer):
    detail_mode_repr = serializers.SerializerMethodField()

    def get_detail_mode_repr(self, obj):
        try:
            return dict(Profile.DETAIL_MODES)[obj.detail_mode]
        except KeyError:
            return None

    class Meta:
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        model = Profile
        exclude = ['id', 'user']


# Serializers define the API representation.
class UserSerializer(serializers.ModelSerializer):
    fullname = serializers.SerializerMethodField(required=False)
    last_login = serializers.SerializerMethodField(required=False)
    profile = ProfileSerializer()

    class Meta:
        permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser, TokenHasScope]
        model = User
        fields = ('url', 'username', 'first_name', 'last_name', 'email', 'is_staff', 'last_login', 'fullname', 'id', 'profile')

    def get_fullname(self, obj):
        tmp = obj.get_full_name()

        if tmp == "":
            return obj.email
        return tmp

    def get_last_login(self, obj):
        if isinstance(obj.last_login, basestring):
            return obj.last_login
        elif obj.last_login:
            return obj.last_login.strftime("%Y-%m-%d %H:%M")


        return None

    @transaction.atomic
    def create(self, validated_data):
        profile_data = None

        try:
            profile_data = validated_data.pop('profile')
        except KeyError:
            pass

        user = User.objects.create(**validated_data)

        # create profile data
        if profile_data:
            try:
                p_instance = user.profile
                serializer = ProfileSerializer(p_instance, partial=True)
                serializer.update(p_instance, profile_data)

            except Profile.DoesNotExist:
                Profile.objects.create(user=user, **profile_data)

        return user

    @transaction.atomic
    def update(self, instance, validated_data):
        profile_data = None

        try:
            profile_data = validated_data.pop('profile')
        except KeyError:
            pass

        if profile_data:
            p_instance = instance.profile
            serializer = ProfileSerializer(p_instance, partial=True)

            serializer.update(p_instance, profile_data)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance

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

    @list_route(methods=['get', 'patch'], permission_classes=[permissions.AllowAny])
    def me(self, request):
        """
        Get personal account details
        """
        if request.user.is_authenticated():
            try:
                profile = request.user.profile

            except Profile.DoesNotExist:
                p = Profile(user=request.user)
                p.save()

            serializer = UserSerializer(instance = request.user, context={'request': request})

            if request.method == 'PATCH':
                password = request.data.pop('password', None)

                serializer.update(request.user, request.data)
                if password:
                    request.user.set_password(password)
                    request.user.save()

            return Response(serializer.data)
        else:
            return Response({'authenticated': False})

    @list_route(methods=['post'], permission_classes=[permissions.AllowAny])
    def check_email(self, request):
        email = request.data.get('email')

        if email != None:
            try:
                usr = User.objects.get(email=email)

                return Response({
                    'email': email,
                    'available': False
                })
            except User.DoesNotExist:
                return Response({
                    'email': email,
                    'available': True
                })

        return Response({
            'error': "Email is mandatory field to check if email is free"
        })

    @list_route(methods=['get', 'post'])
    def activate(self, request):

        email = None

        if request.method == 'GET':
            email = request.GET.get('email', None)

        else:
            email = request.data.get('email', None)

        if request.user.is_staff and email != None:
            try:
                usr = User.objects.get(email=email)

                if not usr.is_active:
                    usr.is_active = True
                    usr.save()

                    users = [usr]
                    staff = User.objects.filter(is_staff=True)
                    for user in staff:
                        users.append(user)

                    History.new(event=History.APPROVE, actor=request.user,
                        object=usr, authorized=users)

                    return Response({
                        'success': True
                    })

                return Response({
                    'error': 'User already activated'
                })

            except User.DoesNotExist:
                return Response({
                    'error': "Can't activate user, %s it doesn't exist" % email
                })

        return Response({
            'error': "Invalid or not authorized request"
        })

    @list_route(methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        if request.user.is_authenticated():
            return Response({
                    'error': "An already registered user can't register new users!"
                })
        password = request.data.pop('password', None)
        email = request.data.get('email', None)

        if email != None and password != None:
            try:
                usr = User.objects.get(email=email)

                return Response({
                    'error': "An user with this email already exists"
                })
            except User.DoesNotExist:
                request.data['username']=email[:30]
                serializer = UserSerializer(data=request.data, context={'request': request})

                valid = serializer.is_valid(raise_exception=True)

                if valid:
                    new_user = serializer.save()

                    new_user.set_password(password)
                    new_user.is_active=False
                    new_user.save()

                    History.new(event=History.ADD, actor=new_user,
                        object=new_user, authorized=User.objects.filter(is_staff=True))

                    return Response(serializer.data)

                return Response({
                    'error': "User details invalid"
                })

        return Response({
            'error': "Email and password are mandatory fields on registering a new user"
        })

    @list_route(methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        """
            Login user
        """
        if not request.user.is_authenticated():
            username = request.data.get('username', None)
            password = request.data.get('password', None)

            if request.data.get('remember', False):
                request.session.set_expiry(1296000) # if set to remember, keep for 2 weeks


            if '@' in username:
                try:
                    user = User.objects.get(email=username)
                    username = user.username
                except:
                    pass

            user = authenticate(username=username, password=password)
            if user is not None:

                if user.is_active:
                    login(request, user)
                else:
                    return Response({
                            'authenticated': False,
                            'error': 'This account is disabled. This may be because of you are waiting approval.If this is not the case, please contact the administrator'
                        })
            else:
                return Response({
                        'authenticated': False,
                        'error': 'This login username and password are invalid'
                    })

        return self.me(request)

    @list_route(methods=['get'])
    def logout(self, request):
        """
            Logout a logged in user
        """
        logout(request)

        return Response({'authenticated': False})
