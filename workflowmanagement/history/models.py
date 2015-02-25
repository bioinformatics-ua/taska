from django.db import models
from process.models import ProcessTaskUser

from django.contrib.auth.models import User

from django.contrib.contenttypes import generic
from django.contrib.contenttypes.models import ContentType



class History(models.Model):
    ''' Describes all actions executed over the system.

    Each lines represents semantically every possible action over the system. basing it in three parameters, `event`, `actor` and `object`.
    This takes in consideration each instance is an action `event` made by the `actor` over a `object`.

    The `object` is a generic foreign key to any model in the system (Workflow, Task, Process, etc), any model is valid.

    Attributes:
        :event (smallint): Event realized over the generic object
        :actor (User):  :class:`django.contrib.auth.models.User` that realized the action
        :object_owner (User):  :class:`django.contrib.auth.models.User` that owns the object
        :date (datetime): Date the action was realized
        :object (Model): Any model that inherits from :class:`django.models.Model`
        :authorized (User[]): :class:`django.contrib.auth.models.User` authorized users with acccess to this history

    '''
    # Event literals, representing the translation to the possible events the history log can be in
    ADD             = 1
    EDIT            = 2
    DELETE          = 3
    ACCESS          = 4

    EVENTS          = (
            (ADD,       'Add'),
            (EDIT,      'Edit'),
            (DELETE,    'Delete'),
            (ACCESS,    'Access')
        )

    event           = models.PositiveSmallIntegerField(choices=EVENTS, default=ADD)
    actor           = models.ForeignKey(User)
    date            = models.DateTimeField(auto_now_add=True)

    # generic foreign key that refers to the object related to this action
    object_type     = models.ForeignKey(ContentType)
    object_id       = models.PositiveIntegerField()
    object          = generic.GenericForeignKey('object_type', 'object_id')

    authorized      = models.ManyToManyField(User, related_name='authorized')

    class Meta:
        verbose_name_plural = "Historic"
        ordering = ["-id"]

    def obj_repr(self):
        return str(self.object)

    @staticmethod
    def all(user=None):
        """
            Returns user history
        """

        history = History.objects.all()

        if user != None:
            history = history.filter(authorized=user)

        return history


    @staticmethod
    def new(event, actor, object, authorized=None):
        """
        Generates a new generic history object
        """
        action = History(event=event, actor=actor, object=object)

        action.save()

        action.authorized.add(actor)
        if authorized != None:
            for elem in authorized:
                action.authorized.add(elem)

        return action

    @staticmethod
    def type(Model, pk):
        """
        Retrieves all history objects for a given Model
        """
        try:
            req = None
            try:
                # since i have models with MTI, i have to try it first, otherwise i could not retrieve all historic
                req = Model.objects.get_subclass(hash=pk)

            except AttributeError:
                req = Model.objects.get(hash=pk)

            type = ContentType.objects.get_for_model(req)

            return History.objects.filter(object_type=type, object_id=req.id)
        except Model.DoesNotExist:
            pass

        return History.objects.none()
