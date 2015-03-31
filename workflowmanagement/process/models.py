from django.db import models
from django.dispatch import receiver
from django.contrib.auth.models import User

from workflow.models import Workflow
from tasks.models import Task

from utils.hashes import createHash

from django.db.models import Q

class Process(models.Model):
    '''A process is an running instance of a Workflow.

    A workflow can be executed multiple times (and by different people), we call each run of this workflow, a process.

    Attributes:
        :id (int): Private sequential identificator
        :workflow (Workflow): :class:`workflow.models.Workflow` instance this process is based on
        :executioner (User): :class:`django.contrib.auth.models.User` this process is executed by
        :hash (str): Public hash that identifies the process instance publicly
        :start_date (datetime): Creation date
        :end_date (datetime): End date
        :status (smallint): Indicator of the status of execution of the process
        :removed (boolean): Logical indicator of removal status of this workflow

    '''
    # Status literals, representing the translation to the statuses the process can be in
    RUNNING         = 1
    FINISHED        = 2
    CANCELED        = 3
    OVERDUE         = 4

    STATUS          = (
            (RUNNING,   'Process is running'),
            (FINISHED,  'Process has ended successfully'),
            (CANCELED,  'Process was canceled'),
            (OVERDUE,   'Process has gone over end_date')
        )
    workflow        = models.ForeignKey(Workflow)
    executioner     = models.ForeignKey(User)
    hash            = models.CharField(max_length=50, unique=True)
    start_date      = models.DateTimeField(auto_now_add=True)
    end_date        = models.DateTimeField(null=True)
    status          = models.PositiveSmallIntegerField(choices=STATUS, default=RUNNING)
    removed         = models.BooleanField(default=False)

    @staticmethod
    def statusCode(interpret_code):
        for code, translation in Process.STATUS:
            if code == interpret_code:
                return translation

        return "Unknown"

    def __str__(self):
        return ('%s (started %s by %s)' % (self.workflow, self.start_date.strftime("%Y-%m-%d %H:%M"), self.executioner.get_full_name())).encode('utf-8')

    def tasks(self):
        return ProcessTask.all(process=self)

    '''
        Reaccess tasks status (so we can move the state machine forward)
    '''
    def move(self):
        ptasks = self.tasks()

        for ptask in ptasks.filter(status=ProcessTask.WAITING):
            move = True
            deps = ptask.task.dependencies()

            for dep in deps:
                pdep = ptasks.get(task=dep.dependency)

                if pdep.status != ProcessTask.FINISHED:
                    move=False

            if move:
                ptask.status = ProcessTask.RUNNING
                ptask.save()

    def progress(self):
        all = ProcessTask.all(process=self).count()
        missing = ProcessTask.all(process=self).filter(Q(status=ProcessTask.RUNNING) | Q(status=ProcessTask.WAITING)).count()

        print "ALL:"
        print all
        print "missing"
        print missing

        try:
            return (all-missing)*100 / all
        except ZeroDivisionError:
            return 0

    class Meta:
        ordering = ["-id"]
        verbose_name_plural = "Processes"

    @staticmethod
    def all(workflow=None, executioner=None):
        ''' Returns all valid process instances (excluding logically removed processes)
        '''
        tmp = Process.objects.filter(removed=False)

        if workflow != None:
            tmp=tmp.filter(workflow=workflow)

        if executioner != None:
            tmp=tmp.filter(executioner=executioner)
        # else
        return tmp

@receiver(models.signals.post_save, sender=Process)
def __generate_process_hash(sender, instance, created, *args, **kwargs):
    '''This method uses the post_save signal to automatically generate unique public hashes to be used when referencing an process.
    '''
    if created:
        instance.hash=createHash(instance.id)
        instance.save()

class ProcessTask(models.Model):
    '''A task assignment, in the context of a Process.

    This model connects several workflow related tasks with a process instance. Defining a process implies setting up process tasks.

    Attributes:
        :process (Process): :class:`Process` related with this instance
        :task (Task): :class:`workflow.models.Task` related with this instance
        :status (smallint): Indicator of the status of execution of the process
        :deadline (datetime): Date this Process related Task should end
    '''
    # Status literals, representing the translation to the statuses the process can be in
    WAITING         = 1
    RUNNING         = 2
    FINISHED        = 3
    CANCELED        = 4
    OVERDUE         = 5

    STATUS          = (
            (WAITING,   'Task is waiting execution'),
            (RUNNING,   'Task is running'),
            (FINISHED,  'Task has ended successfully'),
            (CANCELED,  'Task was canceled'),
            (OVERDUE,   'Task has gone over end_date')
        )
    process         = models.ForeignKey(Process)
    task            = models.ForeignKey(Task)
    status          = models.PositiveSmallIntegerField(choices=STATUS, default=WAITING)
    deadline        = models.DateTimeField()
    hash            = models.CharField(max_length=50)
    removed         = models.BooleanField(default=False)

    def __str__(self):
        return ('%s - %s' % (self.task, self.process)).encode('utf-8')

    def users(self):
        return ProcessTaskUser.all(processtask=self)

    @staticmethod
    def all(process=None):
        ''' Returns all valid process task instances (excluding logically removed process tasks)

        '''
        tmp = ProcessTask.objects.filter(removed=False)

        if process != None:
            tmp=tmp.filter(process=process)

        return tmp

@receiver(models.signals.post_save, sender=ProcessTask)
def __generate_processtask_hash(sender, instance, created, *args, **kwargs):
    '''This method uses the post_save signal to automatically generate unique public hashes to be used when referencing an process.
    '''
    if created:
        instance.hash=createHash(instance.id)
        instance.save()

class ProcessTaskUser(models.Model):
    '''Model that connects a ProcessTask and a User

    Each task can have multiple users associated (or can be reassigned).

    Attributes:
        :user (User): :class:`django.contrib.auth.models.User` related with this instance
        :processtask (ProcessTask): class:`ProcessTask` related with this instance
        :reassigned (boolean): Indicates if this user was reassignment in the middle of a task
        :reassign_date (datetime): Timestamp of this user reassignment (if any)
    '''

    user            = models.ForeignKey(User)
    processtask     = models.ForeignKey(ProcessTask)
    reassigned      = models.BooleanField(default=False)
    reassign_date   = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-processtask__deadline']

    @staticmethod
    def all(processtask=None, related=False):
        ''' Returns all valid processtask instances

        '''
        tmp = None
        if related:
            tmp = ProcessTaskUser.objects.select_related('processtask').all()
        else:
            tmp = ProcessTaskUser.objects.all()

        if processtask != None:
            tmp=tmp.filter(processtask=processtask)

        return tmp

class Request(models.Model):
    '''Represents a request made over a ProcessTask assignment.

    Each user assigned to a ProcessTask, is allowed to make requests about the task (such as asking for reassignments or for task clarification).

    Attributes:
        :processtaskuser (ProcessTaskUser): :class:`ProcessTaskUser` related with this request
        :type (smallint): Type of the request
        :title (str): Title of the request message (if any message annexed)
        :message (str): Content of the request message (if any message annexed)
        :date (datetime): Date the request we made on
    '''
    # TYPE literals, representing the translation to the type of requests available
    REASSIGN        = 1
    CLARIFICATION   = 2

    TYPES           = (
            (REASSIGN,   'Ask for reassignment of task'),
            (CLARIFICATION,  'Ask for task clarification'),
        )
    hash            = models.CharField(max_length=50, default="ERROR")
    processtaskuser = models.ForeignKey(ProcessTaskUser)
    type            = models.PositiveSmallIntegerField(choices=TYPES, default=CLARIFICATION)
    title           = models.CharField(max_length=100, null=True)
    message         = models.TextField(null=True)
    date            = models.DateTimeField(auto_now_add=True)
    resolved        = models.BooleanField(default=False)
    removed         = models.BooleanField(default=False)

    class Meta:
        ordering = ['-id']

    def process(self):
        return self.processtaskuser.processtask.process.hash

    def task(self):
        return self.processtaskuser.processtask.task.hash

    @staticmethod
    def all(executioner=None, requester=None):
        tmp = Request.objects.filter(removed=False)

        if executioner != None:
            tmp = tmp.filter(processtaskuser__processtask__process__executioner=executioner)

        if requester != None:
            tmp = tmp.filter(processtaskuser__user=requester)

        return tmp

    def __str__(self):
        ptask = self.processtaskuser.processtask
        return "Request for Task %s in Process %s" % (ptask.task.__str__(), ptask.process.__str__())


@receiver(models.signals.post_save, sender=Request)
def __generate_request_hash(sender, instance, created, *args, **kwargs):
    '''This method uses the post_save signal to automatically generate unique public hashes to be used when referencing an request.
    '''
    if created:
        instance.hash=createHash(instance.id)
        instance.save()
