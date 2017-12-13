# coding=utf-8
from rest_framework import viewsets, filters
from rest_framework.decorators import api_view, list_route

from rest_framework.response import Response
from rest_framework import permissions

from django.contrib.auth.models import User

from django.contrib.auth import authenticate, login, logout

from accounts.models import Profile, UserRecovery

from history.models import History

from django.utils import timezone

from accounts.serializers.UserSerializer import UserSerializer

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
        userList = []
        for usr in request.data:
            email = usr.get('email', None)
            password = "12345" #Default password, the user will be notice to change it. This needs to be changed

            if email != None:
                email = email.lower()

                try:
                    usr = User.objects.get(email=email)
                    userList += [usr]
                except User.DoesNotExist:
                    try:
                        usr['first_name'] = usr['firstName']
                        usr['last_name'] = usr['lastName']
                    except:
                        usr['first_name'] = ""
                        usr['last_name'] = ""

                    usr['username'] = email[:30]
                    usr['email'] = email
                    usr['profile'] = {'detail_mode': Profile.get_default_detail_mode()}

                    serializer = UserSerializer(data=usr)
                    valid = serializer.is_valid(raise_exception=True)

                    if valid:
                        new_user = serializer.save()

                        new_user.set_password(password)
                        new_user.is_active = True  #I decide let the userbe active in the first place because this is a invite
                        new_user.save()
                        userList += [new_user]

                        ur = UserRecovery(user=new_user)
                        ur.save()

                        History.new(event=History.INVITE, actor=request.user,
                                    object=ur, authorized=[new_user])
            else:
                return Response({
                        'error': "Email are mandatory fields on registering a new user"
                    })
        serializer_context = {
                'request': request,
            }
        serializerAll = UserSerializer(userList, many=True, context=serializer_context)
        return Response(serializerAll.data)

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