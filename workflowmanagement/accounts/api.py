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

# serializers user profile
class ProfileSerializer(serializers.ModelSerializer):
    '''Serializer to handle :class:`accounts.models.Profile` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    detail_mode_repr = serializers.SerializerMethodField()

    def get_detail_mode_repr(self, obj):
        '''This method serializes the detail_mode as a textual representation.
        '''
        try:
            return dict(Profile.DETAIL_MODES)[obj.detail_mode]
        except KeyError:
            return None

    class Meta:
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]
        model = Profile
        exclude = ['id', 'user']


# serializers define the API representation.
class UserSerializer(serializers.ModelSerializer):
    '''Serializer to handle :class:`django.contrib.auth.models.User` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    fullname = serializers.SerializerMethodField(required=False)
    last_login = serializers.SerializerMethodField(required=False)
    have_tasks = serializers.SerializerMethodField(required=False)
    profile = ProfileSerializer()

    class Meta:
        permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser, TokenHasScope]
        model = User
        fields = ('url', 'username', 'first_name', 'last_name', 'email', 'is_staff', 'last_login', 'fullname', 'id', 'profile', 'have_tasks')

    def get_fullname(self, obj):
        '''This method serializes the user name as a textual representation, falling back to the email when not available.
        '''
        tmp = obj.get_full_name()

        if tmp == "":
            return obj.email
        return tmp

    def get_last_login(self, obj):
        '''This method serializes the user last login date as a textual representation.
        '''
        if isinstance(obj.last_login, basestring):
            return obj.last_login
        elif obj.last_login:
            return obj.last_login.strftime("%Y-%m-%d %H:%M")


        return None

    def get_have_tasks(self, obj):
        try:
            ptasks = ProcessTaskUser.all(finished=False, reassigned=False).filter(user=obj)
            if len(ptasks) > 0:
                return True
        except:
            pass #Ignore because I will return false bellow
        return False

    @transaction.atomic
    def create(self, validated_data):
        '''This handles the custom user creation, serializating validated data from the web services input
        into the proper object, plus also inserting profile information, all in the same serialization.
        '''
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
        '''This handles the custom user update, serializating validated data from the web services input
        into the proper object, plus also updating profile information, all in the same serialization.
        '''
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
    API to handle User manipulation

    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

    filter_backends = [filters.DjangoFilterBackend, filters.OrderingFilter]
    filter_fields = ["username", "first_name", "last_name", "email", "is_staff", "last_login", "id"]

    def list(self, request, *args, **kwargs):
        """
        Return a list of users)
        """
        return super(UserViewSet, self).list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """
        Insert a new user (staff only)
        """
        return super(UserViewSet, self).create(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a user, by id
        """
        return super(UserViewSet, self).retrieve(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """
        Update a user, by id (staff only)
        """
        return super(UserViewSet, self).update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """
        Partial Update a user, by id (staff only)
        """
        return super(UserViewSet, self).partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        Delete a user, by id (staff only)
        """
        return super(UserViewSet, self).partial_update(request, *args, **kwargs)

    @list_route(methods=['get', 'patch'], permission_classes=[permissions.AllowAny])
    def me(self, request):
        """
        Get personal account details, if logged in.
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
        '''Case insensitive checks if a email is available to be registered as a username.
        '''
        email = request.data.get('email')

        if email != None:
            email = email.lower()
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
        '''Activates an inactive user. Can only be used by staff users to activate other users.
        '''
        email = None

        if request.method == 'GET':
            email = request.GET.get('email', None)

        else:
            email = request.data.get('email', None)

        if request.user.is_staff and email != None:
            email = email.lower()
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
        ''' Allows users to register themselves. Being then put on a waiting list to be approved.
        '''
        if request.user.is_authenticated():
            return Response({
                    'error': "An already registered user can't register new users!"
                })
        password = request.data.pop('password', None)
        email = request.data.get('email', None)

        if email != None and password != None:
            email = email.lower()

            try:
                usr = User.objects.get(email=email)

                return Response({
                    'error': "An user with this email already exists"
                })
            except User.DoesNotExist:
                request.data['username']=email[:30]
                request.data['email']=email
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

    @list_route(methods=['post'])#, permission_classes=[permissions.AllowAny]
    def invite(self, request):
        '''
            Allows a user to register anothers users. Being then put on a waiting list to be approved.
        '''
        email = request.data.get('email', None)
        password = "12345" #Default password, the user will be notice to change it

        if email != None:
            email = email.lower()

            try:
                usr = User.objects.get(email=email)

                return Response({
                    'error': "An user with this email already exists"
                })
            except User.DoesNotExist:
                request.data['username'] = email[:30]
                request.data['email'] = email
                serializer = UserSerializer(data=request.data, context={'request': request})

                valid = serializer.is_valid(raise_exception=True)

                if valid:
                    new_user = serializer.save()

                    new_user.set_password(password)
                    new_user.is_active = True  #I decide let the userbe active in the first place because this is a invite
                    new_user.save()

                    History.new(event=History.INVITE, actor=request.user,
                                object=new_user, authorized=User.objects.filter(is_staff=True))

                    return Response(serializer.data)

                return Response({
                    'error': "User details invalid"
                })

        return Response({
            'error': "Email and password are mandatory fields on registering a new user"
        })

    @list_route(methods=['post'], permission_classes=[permissions.AllowAny])
    def recover(self, request):
        ''' Allows users to ask for password recovery(which needs to be confirmed).
        '''
        if request.user.is_authenticated():
            return Response({
                    'error': "An already logged in user can't recover a password!"
                })
        email = request.data.get('email', None)

        if email != None:
            email = email.lower()
            try:
                usr = User.objects.get(email=email)

                ur = UserRecovery(user=usr)

                ur.save()

                History.new(event=History.RECOVER, actor=usr,
                        object=ur, authorized=[usr])

                return Response({'success': True})

            except User.DoesNotExist:
                pass

            return Response({
                'error': "An user with this email does not exist."
            })

    @list_route(methods=['post'], permission_classes=[permissions.AllowAny])
    def changepassword(self, request):
        ''' Allows users to change their own password, after confirming a password recovery.
        '''
        if request.user.is_authenticated():
            return Response({
                    'error': "An already logged in user can't recover a password!"
                })

        hash    = request.data.get('hash', None)
        new_pass= request.data.get('password', None)

        if hash != None and new_pass != None:
            try:
                ur = UserRecovery.objects.get(hash=hash, used=False, validity__gt=timezone.now())

                ur.user.set_password(new_pass)
                ur.user.save()

                ur.used=True
                ur.save()

                History.new(event=History.EDIT, actor=ur.user,
                    object=ur.user, authorized=[ur.user])

                return Response({'success': True})
            except UserRecovery.DoesNotExist:
                return Response({
                    'error': "Either the request does not exist, or it has expired."
                })

        return Response({
            'error': "This request is not valid."
        })

    @list_route(methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        """
            Logs in an user doing case insentitive validation for emails.
        """
        if not request.user.is_authenticated():
            username = request.data.get('username', None)
            password = request.data.get('password', None)

            if request.data.get('remember', False):
                request.session.set_expiry(1296000) # if set to remember, keep for 2 weeks

            if username != None:
                username = username.lower()

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
            Logs out a logged in user
        """
        logout(request)

        return Response({'authenticated': False})
