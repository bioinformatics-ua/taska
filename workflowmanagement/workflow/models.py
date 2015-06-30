from django.db import models, transaction
from django.db.models import Q
from django.dispatch import receiver
from django.contrib.auth.models import User

from utils.hashes import createHash

class Workflow(models.Model):
    '''Represents generically an repeatable workflow, created by a Researcher.

    It's essentially the main block of the workflow management system.

    Attributes:
        :id (int): Private sequential identificator
        :owner (User): :class:`django.contrib.auth.models.User` instance that created this workflow
        :hash (str): Public hash that identifies the workflow instance publicly
        :title (str): Short title that describes the workflow
        :create_date (datetime): Creation date
        :latest_update (datetime): Date this instance was last updated
        :removed (boolean): Logical indicator of removal status of this workflow
    '''
    owner           = models.ForeignKey(User)
    hash            = models.CharField(max_length=50, unique=True)
    title           = models.CharField(max_length=100)
    create_date     = models.DateTimeField(auto_now_add=True)
    latest_update   = models.DateTimeField(auto_now=True)
    removed         = models.BooleanField(default=False)

    class Meta:
        ordering = ['-id']

    def permissions(self):
        (wp, new) = WorkflowPermission.objects.get_or_create(workflow=self)

        if new:
            wp.save()

        return wp

    def tasks(self):
        from tasks.models import Task

        val = Task.all(workflow=self)

        return val

    def assocProcesses(self):
        from process.models import Process

        return Process.all(workflow=self)

    def clone(self):
        new_kwargs = dict([(fld.name, getattr(self, fld.name)) for fld in self._meta.fields if fld.name != self._meta.pk.name]);
        try:
            del new_kwargs['hash']
        except:
            pass
        return self.__class__.objects.create(**new_kwargs)

    @transaction.atomic
    def fork(self):
        fork = self.clone()
        fork.permissions()

        depmap = {}

        # First pass we create the tasks (because we dont make assumptions on how dependencies are connected)
        for task in self.tasks():
            ntask = task.clone(fork)
            depmap[task.id] = ntask

        # Second pass we create the dependencies based on the depmap changes
        for task in self.tasks():
            deps = []
            for dep in task.dependencies():
                deps.append(depmap[dep.dependency.id])

            depmap[task.id].replaceDependencies(deps)

        fork.title = "%s (Fork)" % fork.title
        fork.save()

        return fork


    @staticmethod
    def all(user=None, workflow=None):
        ''' Returns all valid workflow instances (excluding logically removed workflows)

        Also allows to filter by user allowed workflows
        '''
        tmp = Workflow.objects.filter(removed=False)

        if user != None:
            tmp=tmp.filter(Q(owner=user) | Q(workflowpermission__public=True))

        if workflow != None:
            tmp=tmp.filter(Q(workflow=workflow) | Q(workflowpermission__public=True))
        # else
        return tmp

    def __unicode__(self):
        '''Returns the workflow name, based on the title, or unnamed if the workflow doesn't have a name
        '''
        if self.title:
            return self.title

        return 'Unnamed'

@receiver(models.signals.post_save, sender=Workflow)
def __generate_workflow_hash(sender, instance, created, *args, **kwargs):
    '''This method uses the post_save signal to automatically generate unique public hashes to be used when referencing an workflow.
    '''
    if created:
        instance.hash=createHash(instance.id)
        instance.save()

class WorkflowPermission(models.Model):
    '''Represents generic permissions of a Workflow

    This model allows users to specify global such as public availability, listing on search and forkability
    restrictions over a owned workflow.

    Attributes:
        :workflow (Workflow): :class:`Workflow` instance this permissions pertain to
        :public (boolean): Indicates the public visibility of the workflow instance
        :searchable (boolean): Indicates if the workflow instance is to be listed on searches
        :forkable (boolean): Indicates if the workflow instance can be forked by other users
    '''
    workflow        = models.OneToOneField(Workflow)
    public          = models.BooleanField(default=True)
    searchable      = models.BooleanField(default=True)
    forkable        = models.BooleanField(default=True)

    def __unicode__(self):
        '''Returns a certain workflow permissions on a string
        '''

        return unicode(self.workflow)+' Permissions[ Public='+unicode(self.public)+', Searchable='+unicode(self.searchable)+', Forkable='+unicode(self.forkable)+']'

