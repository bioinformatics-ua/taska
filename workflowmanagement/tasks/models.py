from django.db import models

from workflow.models import Workflow

class Task(models.Model):
    '''Represents generically a task, executed in relation to an Workflow instance.

    Each workflow instance consists of one or more Tasks.

    Note:
        This model is meant to be generic and abstract, and must be used through a concrete implementation of a task (for example SimpleTask), not directly.

    Attributes:
        :id (int): Private sequential identificator
        :sortid (int): Integer value that describes the order (inside the workflow) that this task is to be executed in
        :title (str): Short title that describes the task
        :description (str): Description of the task at hand, and how it should be executed
        :workflow (Workflow): :class:`workflow.models.Workflow` instance this task is inserted into
    '''
    sortid          = models.IntegerField()
    title           = models.CharField(max_length=100)
    description     = models.TextField()
    workflow        = models.ForeignKey(Workflow)

class TaskDependency(models.Model):
    '''Represents a dependency a Task instance may have over other tasks.

    Each task can require other tasks to be executed first. This model represents this dependencies, if they exist.

    Attributes:
        :id (int): Private sequential identificator
        :maintask (Task): :class:`Task` instance this dependency refers to
        :dependency (Task): :class:`Task` instance the maintask depends upon to be executed
    '''
    maintask        = models.ForeignKey(Task)
    dependency      = models.ForeignKey(Task)

class SimpleTask(Task):
    '''Basic concretization of a generic task.

    This is a basic implementation of the generic task model, and has no extra behaviour beyond the one provided by the generic model.
    Is meant to be used for simple check tasks, that are executed outside of the system and can not be ascertained through it.

    '''
    pass
