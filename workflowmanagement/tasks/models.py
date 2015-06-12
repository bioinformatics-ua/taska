from django.db import models

from workflow.models import Workflow

from model_utils.managers import InheritanceManager

from django.dispatch import receiver

from utils.hashes import createHash

from material.models import Resource

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
    hash            = models.CharField(max_length=50)
    sortid          = models.IntegerField()
    title           = models.CharField(max_length=100)
    description     = models.TextField(null=True, blank=True)
    workflow        = models.ForeignKey(Workflow)

    # We need this to be able to properly guess the type
    objects         = InheritanceManager()

    removed         = models.BooleanField(default=False)

    ttype           = models.CharField(max_length=100)

    resources       = models.ManyToManyField(Resource)

    class Meta:
        ordering = ['-id']

    def type(self):
        return self._meta.app_label + '.' +self.__class__.__name__

    def clone(self, workflow):
        new_kwargs = dict([(fld.name, getattr(self, fld.name)) for fld in self._meta.fields if fld.name != self._meta.pk.name]);
        try:
            del new_kwargs['hash']
            del new_kwargs['id']
        except:
            pass

        new_kwargs['workflow'] = workflow

        task = self.__class__.objects.create(**new_kwargs)

        for resource in self.resources.all():
            task.resources.add(resource.clone())

        return task

    def __unicode__(self):
        ''' Represents the task at hand, usually just shows the title (or Unnamed if there's no title for the task).
        '''
        if self.title:
            return self.title

        return 'Unnamed'

    def replaceDependencies(self, dependencies):
        '''
        '''
        all_deps = TaskDependency.objects.filter(maintask=self)

        removed_deps = all_deps.exclude(dependency__in=dependencies)

        removed_deps.delete()

        for dep in dependencies:
            TaskDependency.objects.get_or_create(maintask=self, dependency=dep)


    @staticmethod
    def all(workflow=None, subclasses=True, owner=None):
        ''' Returns all valid task instances (excluding logically removed tasks)

        '''
        tmp = Task.objects.filter(removed=False)

        if workflow != None:
            tmp=tmp.filter(workflow=workflow)

        if owner != None:
            tmp=tmp.filter(workflow__owner=owner)
        # else
        if subclasses:
            return tmp.select_subclasses()

        return tmp

    @staticmethod
    def getPossibleDependencies(workflow, task=None):
        ''' Gives the possible dependencies for a Task, given a workflow.

        Optionally is possible the define the point of origin, to be excluded from the results, using `task`

        Args:
            :workflow (Workflow): :class:`workflow.models.Workflow` instance to get dependencies possible from.
        Kwargs:
            :task (Task, optional) :class:`Task` instance indicating point of origin (will be excluded from results)

        Returns
            QuerySet of Tasks that can be used as dependencies
        '''
        possibilities = Task.objects.filter(workflow=workflow)

        if task != None:
            possibilities=possibilities.exclude(id=task.id)

        return possibilities

    @staticmethod
    def init_serializer(instance=None, data=None, many=False, partial=False):
        from .api import TaskSerializer
        return TaskSerializer(instance=instance, data=data, many=many, partial=partial)

    def get_serializer(self):
        serializer_name = '__%s'%(self.type())
        serializer = None

        if hasattr(Task, serializer_name):
            serializer = getattr(Task, serializer_name)
        else:
            serializer = self.init_serializer()
            setattr(Task, serializer_name, serializer)

        return serializer

    def get_exporter(self, mode, processtask):
        from export import ResultExporter
        return ResultExporter.getInstance(mode, processtask)

    def to_representation(self, instance):
        serializer = self.get_serializer()

        return serializer.to_representation(instance)

    def to_internal_value(self, instance):
        serializer = self.get_serializer()

        return serializer.to_internal_value(instance)

    def dependencies(self):
        return TaskDependency.objects.filter(maintask=self)

    def remove(self):
        self.removed = True
        self.save()

        return self


@receiver(models.signals.post_save)
def __generate_task_hash(sender, instance, created, *args, **kwargs):
    '''This method uses the post_save signal to automatically generate unique public hashes to be used when referencing an task.
    '''
    if not isinstance(instance, Task):
         return

    if created:
        instance.hash=createHash(instance.id)
        instance.ttype = instance.type()
        instance.save()

class TaskDependency(models.Model):
    '''Represents a dependency a Task instance may have over other tasks.

    Each task can require other tasks to be executed first. This model represents this dependencies, if they exist.

    Attributes:
        :id (int): Private sequential identificator
        :maintask (Task): :class:`Task` instance this dependency refers to
        :dependency (Task): :class:`Task` instance the maintask depends upon to be executed
    '''
    maintask        = models.ForeignKey(Task, related_name='maintask')
    dependency      = models.ForeignKey(Task, related_name='dependency')

    class Meta:
        verbose_name_plural = "Task dependencies"

    def __unicode__(self):
        '''
        '''
        return u"TaskDependency: {maintask: %s | dependency %s }" % (str(self.maintask), str(self.dependency))

class SimpleTask(Task):
    '''Basic concretization of a generic task.

    This is a basic implementation of the generic task model, and has no extra behaviour beyond the one provided by the generic model.
    Is meant to be used for simple check tasks, that are executed outside of the system and can not be ascertained through it.

    '''
    @staticmethod
    def init_serializer(instance=None, data=None, many=False, partial=False):
        ''' This method must override default init_serializer behaviour for a task.

        Without init_serializer() wouldnt be possible using to process the MTI.
        '''
        from .api import SimpleTaskSerializer
        return SimpleTaskSerializer(instance=instance, data=data, many=many, partial=partial)
    pass
