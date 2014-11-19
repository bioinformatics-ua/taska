from django.db import models
from django.dispatch import receiver

from hashids import Hashids

class Workflow(models.Model):
    '''This models represents generically an Workflow, created by a Researcher.

    It's essentially the main block of the workflow management system.

    Attributes:
        id (int): Private sequential identificator
        hash (str): Public hash that identifies the workflow instance publicly
        title (str): Short title that describes the workflow
        create_date (datetime): Creation date
        latest_update (datetime): Date this instance was last updated
    '''
    hash          = models.CharField(max_length=10)
    title         = models.CharField(max_length=100)
    create_date   = models.DateTimeField(auto_now_add=True)
    latest_update = models.DateTimeField(auto_now=True)
    removed       = models.BooleanField(default=False)

@receiver(models.signals.post_save, sender=Workflow)
def generate_workflow(sender, instance, created, *args, **kwargs):
    '''Generator of public hash keys for the workflow instances.

    This method uses the post_save signal to automatically generate unique public hashes to be used when referencing an workflow.
    This is done to introduce identificator obfuscation and to stop URL snooping attempts.
    '''
    if created:
        hashids = Hashids(salt="esh2YTBZesh2YTBZ", min_length=5)
        self.hash=hashids.encrypt(self.id)
        self.save()

class Task(models.Model):
    '''This models represents a Task, executed in relation to an Workflow instance.

    Each workflow instance consists of one or more Tasks

    Attributes:
        id (int): Private sequential identificator
        sortid (int): Integer value that describes the order (inside the workflow) that this task is to be executed in
        title (str): Short title that describes the task
        description (str): Description of the task at hand, and how it should be executed
        workflow(Workflow): Workflow instance this task inserted into
    '''
    sortid          = models.IntegerField()
    title           = models.CharField(max_length=100)
    description     = models.TextField()
    workflow        = models.ForeignKey(Workflow)
