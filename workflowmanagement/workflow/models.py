from django.db import models
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

    @staticmethod
    def all(user=None, workflow=None):
        ''' Returns all valid workflow instances (excluding logically removed workflows)

        Also allows to filter by user allowed workflows
        '''
        tmp = Workflow.objects.filter(removed=False)

        if user != None:
            tmp=tmp.filter(owner=user)

        if workflow != None:
            tmp=tmp.filter(workflow=workflow)
        # else
        return tmp.filter(workflowpermission__public=True)

    def __str__(self):
        '''Returns the workflow name, based on the title, or unnamed if the workflow doesn't have a name
        '''
        if self.title:
            return self.title.encode('utf-8')

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

    def __str__(self):
        '''Returns a certain workflow permissions on a string
        '''

        return str(self.workflow)+' Permissions[ Public='+str(self.public)+', Searchable='+str(self.searchable)+', Forkable='+str(self.forkable)+']'

