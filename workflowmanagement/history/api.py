# coding=utf-8
from rest_framework import renderers, serializers, viewsets, permissions, mixins
from rest_framework.decorators import api_view, detail_route, list_route
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework import status, filters, generics


from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User
from oauth2_provider.ext.rest_framework import TokenHasReadWriteScope, TokenHasScope

from history.models import *
from django.apps import apps
from utils.api_related import create_serializer, AliasOrderingFilter

@api_view(('GET',))
def root(request, format=None):
    return Response({
        #'User Listing   ': reverse('user-list', request=request, format=format),
    })

class GenericObjectField(serializers.RelatedField):
    """
    A custom field to use for the `object` generic relationship.
    """

    def to_representation(self, value):
        """
        Serialize objects to a simple textual representation.
        """
        try:
            return value.rpr()
        except:
            try:
                return str(value.hash)
            except:
                return "DUMMY"

# Serializers define the API representation.
class HistorySerializer(serializers.ModelSerializer):
    '''Serializer to handle :class:`history.models.History` objects serialization/deserialization.

    This class is used by django-rest-framework to handle all object conversions, to and from json,
    while allowing in the future to change this format with any other without losing the abstraction.

    '''
    object = GenericObjectField(read_only=True)
    event = serializers.SerializerMethodField()
    object_type = serializers.SerializerMethodField()
    object_repr = serializers.SerializerMethodField()
    actor_repr = serializers.SerializerMethodField()

    class Meta:
        model = History
        exclude = ['object_id', 'authorized']
        permission_classes = [permissions.IsAuthenticated, TokenHasScope]

    def get_object_repr(self, obj):
        '''Polymorphically returns the textual representation(each object decides how to represent itself)
        '''
        return obj.obj_repr()

    def get_event(self, obj):
        '''Returns a textual representation of the event that ocurred over the object being logged.
        '''
        return dict(History.EVENTS)[obj.event]

    def get_object_type(self, obj):
        '''Returns a textual representation of the type of object, typically the class name.
        '''
        return obj.object.__class__.__name__

    def get_actor_repr(self, obj):
        '''Returns a textual representation of the actor playing the action.
        '''
        return obj.actor.get_full_name() or obj.actor.email

# ViewSets define the view behavior.
class HistoryViewSet(   mixins.ListModelMixin,
                        viewsets.GenericViewSet):
    """
    API for History manipulation

    """
    queryset = History.objects.none()
    serializer_class = HistorySerializer

    # we must override queryset to filter by authenticated user
    def get_queryset(self):
        # well accesses fill too much the history i dont think they should show
        return History.all(user=self.request.user).exclude(event=History.ACCESS)

    def list(self, request, *args, **kwargs):
        """
        Return a list of user-related history, across all the system.

        """
        return super(HistoryViewSet, self).list(request, args, kwargs)

    def __filterHistory(self, Model, pk):
        '''Internal class that handles the creation of the History  Serializer based on the object type, and its public hash.

            DEPRECATED: In favor of :class:`history.api.FilteredHistory`
        '''
        serializer = HistorySerializer(many=True, instance=History.type(Model, pk))

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class FilteredHistory(generics.ListAPIView):
    '''
        Listing API view that handles filtering the generic history, based on a set of parameters.
    '''
    queryset = History.objects.none()
    serializer_class = HistorySerializer
    filter_backends = (filters.DjangoFilterBackend, AliasOrderingFilter)
    ordering_fields = ('event', 'date', 'actor')
    ordering_map = {
    }
    # map of possible history filters
    type_map = {
        'process': 'process.Process',
        'request': 'process.Request',
        'workflow': 'workflow.Workflow',
        'task': 'task.Task',
        'result': 'result.Result'
    }
    def get_queryset(self):
        """
            Retrieves the proper object to filter the history by
        """
        kwargs = self.request.parser_context['kwargs']

        mdl = kwargs['model']
        pk = kwargs['pk']

        try:
            ObjModel = apps.get_model(self.type_map[mdl])

            return History.type(ObjModel, pk, related=True).exclude(event=History.ACCESS)

        except KeyError:
            return Response({'error': 'No type of object %s' %mdl})
