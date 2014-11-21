# coding=utf-8
from rest_framework import renderers, serializers, viewsets, permissions, mixins, status
from rest_framework.decorators import api_view, detail_route, list_route, action
from rest_framework.response import Response
from rest_framework.reverse import reverse

from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated

from django.contrib.auth.models import User
from oauth2_provider.ext.rest_framework import TokenHasReadWriteScope, TokenHasScope

from tasks.models import *

from workflow.models import Workflow

#@api_view(('GET',))
#def root(request, format=None):
#    return Response({
#        #'User Listing   ': reverse('user-list', request=request, format=format),
#    })

# Serializers define the API representation.
class TaskSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Task
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

# ViewSets define the view behavior.
class TaskViewSet(  mixins.CreateModelMixin,
                    mixins.ListModelMixin,
                    mixins.RetrieveModelMixin,
                    viewsets.GenericViewSet):
    """
    API for Task manipulation

    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    def list(self, request, *args, **kwargs):
        """
        Return a list of user-attributed tasks

        TODO: Implement

        """
        return Response({})

    def create(self, request, *args, **kwargs):
        """
        Add a result as a response to a task

        TODO: Implement

        """
        return Response({})

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a task details, by id

        TODO: Implement
        """
        return Response({})

    @detail_route(methods=['post'])
    def requests(self, request):
        """
        Make a request related to a task, by id.
        Request can be of several types, such as Clarification, or reassignment

        TODO: Implement
        """
        return Response({})

############################################################
##### Gets possible dependencies for a Task - Private Web service only for administrators
############################################################

class TaskDependenciesView(APIView):
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kw):
        if request.user.is_authenticated() and request.user.is_staff:
            try:
                task = request.POST.get('task', None)
                if task != None:
                    task = Task.objects.get(id=task)
                workflow = Workflow.objects.get(id=request.POST.get('workflow'))
            except:
                raise

            deps = Task.getPossibleDependencies(workflow, task=task)
            jsondeps = []

            for dep in deps:
                jsondeps.append({'id': dep.id, 'title': dep.title})

            response = Response({'dependencies': jsondeps}, status=status.HTTP_200_OK)

        else:
            response = Response({}, status=status.HTTP_403_FORBIDDEN)
        return response
