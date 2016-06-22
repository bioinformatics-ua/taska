from django.db import models
from django.dispatch import receiver
from django.contrib.auth.models import User

from workflow.models import Workflow
from tasks.models import Task

from utils.hashes import createHash

from django.db.models import Q
from django.utils import timezone
from django.db import transaction

from history.models import History

from material.models import File

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
    WAITING         = 5

    STATUS          = (
            (RUNNING,   'Process is running'),
            (FINISHED,  'Process has ended successfully'),
            (CANCELED,  'Process was canceled'),
            (OVERDUE,   'Process has gone over end_date'),
            (WAITING,   'Process is waiting for users availability')
        )
    workflow        = models.ForeignKey(Workflow)
    title           = models.CharField(max_length=200, null=True)
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

    def __unicode__(self):
        return u'%s (started %s)' % (self.title or self.workflow, self.start_date.strftime("%Y-%m-%d %H:%M"))

    def tasks(self):
        return ProcessTask.all(process=self)

    def getAllUsersEnvolved(self):
        tmp = []
        tasks = self.tasks()
        for task in tasks:
            for taskUser in ProcessTaskUser.all(processtask=task):
                if taskUser.getUser() not in tmp:
                    tmp += [taskUser.getUser()]
        return tmp

    @transaction.atomic
    def cancel(self):
        ''' Cancels a process, also canceling all pending tasks in it
        '''
        ptasks = self.tasks()

        for ptask in ptasks:
            if ptask.status == ProcessTask.WAITING_AVAILABILITY  or\
                    ptask.status == ProcessTask.REJECTED or\
                    ptask.status == ProcessTask.WAITING or\
                    ptask.status == ProcessTask.RUNNING:
                ptask.status = ProcessTask.CANCELED
                ptask.save()


        self.status = Process.CANCELED
        self.save()

    @transaction.atomic
    def move(self):
        '''
            Reaccess tasks status (so we can move the state machine forward)
        '''
        ptasks = self.tasks()
        if self.status != Process.WAITING:
            wlist = ptasks.filter(status=ProcessTask.WAITING)

            for ptask in wlist:
                move = True
                deps = ptask.task.dependencies()

                for dep in deps:
                    pdep = ptasks.get(task=dep.dependency)

                    if not (pdep.status == ProcessTask.FINISHED or pdep.status == ProcessTask.CANCELED):
                        move=False

                if move:
                    ptask.status = ProcessTask.RUNNING
                    ptus = ProcessTaskUser.all(processtask=ptask)
                    for ptu in ptus:
                        ptu.status = ProcessTaskUser.RUNNING
                    ptask.save()

                    pusers = ptask.users()
                    for puser in pusers:
                        History.new(event=History.RUN, actor=puser.user, object=puser, authorized=[puser.user], related=[ptask.process])

            if ptasks.filter(Q(status=ProcessTask.WAITING) | Q(status=ProcessTask.RUNNING) | Q(status=ProcessTask.IMPROVING)).count() == 0:
                self.status = Process.FINISHED
                self.end_date = timezone.now()

                History.new(event=History.DONE, actor=self.executioner, object=self)

                self.save()

    def progress(self):
        all = ProcessTask.all(process=self).count()
        done = ProcessTask.all(process=self).filter(Q(status=ProcessTask.FINISHED) | Q(status=ProcessTask.CANCELED)).count()

        try:
            return done*100 / all
        except ZeroDivisionError:
            return 0

    def start(self):
        ptasks = self.tasks()

        for ptask in ptasks:
            if ptask.status == ProcessTask.WAITING_AVAILABILITY or \
                            ptask.status == ProcessTask.REJECTED:
                ptask.status = ProcessTask.WAITING
                ptask.save()

        self.status = Process.RUNNING
        self.save()
        self.move()

    def validateAcceptions(self):
        ptasks = self.tasks()
        for ptask in ptasks:
            for ptasksUser in ProcessTaskUser.all(processtask=ptask):
                if(ptasksUser.status == ProcessTaskUser.WAITING or \
                               ptasksUser.status == ProcessTaskUser.REJECTED ):
                    return False
        return True

    def resignRejectedUser(self, oldUser, newUser):
        #Resign all tasks that the old user belongs
        ptasks = self.tasks()
        for ptask in ptasks:
            ptask.resignRejectedUser(oldUser, newUser)
        self.save()

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
    IMPROVING       = 6
    WAITING_AVAILABILITY = 7
    REJECTED        = 8

    STATUS          = (
            (WAITING,   'Task is waiting execution'),
            (RUNNING,   'Task is running'),
            (FINISHED,  'Task has ended successfully'),
            (CANCELED,  'Task was canceled'),
            (OVERDUE,   'Task has gone over end_date'),
            (IMPROVING,   'Task is running again to be improved'),
            (WAITING_AVAILABILITY, 'Task is waiting for users availability'),
            (REJECTED, 'Task has some users that rejected this task')
        )
    process         = models.ForeignKey(Process)
    task            = models.ForeignKey(Task)
    status          = models.PositiveSmallIntegerField(choices=STATUS, default=WAITING)
    deadline        = models.DateTimeField()
    hash            = models.CharField(max_length=50)
    removed         = models.BooleanField(default=False)

    @staticmethod
    def statusCode(code):
        try:
            return dict(ProcessTask.STATUS)[code]
        except KeyError:
            return "Unknown"

    def __unicode__(self):
        return u'%s - %s' % (self.task, self.process)

    def rpr(self):
        ts = Task.all().get_subclass(id=self.task.id)
        return "%s/%s" % (ts.type(), self.hash)

    def users(self):
        return ProcessTaskUser.all(processtask=self)

    def user(self, user):
        return ProcessTaskUser.all(processtask=self).get(user=user)

    def refreshState(self):
        #translate
        #Verificar se todos aceitaram
        #   Se sim, mudar estado para waiting
        #   Se nao, manter estado de waitingavailability
        #   Se alguem recusou, mudar estado para rejected

        allUser = ProcessTaskUser \
            .all(processtask=self, reassigned=False)
        allAccepted = True

        for usr in allUser:
            if usr.status ==  ProcessTaskUser.REJECTED:
                self.status = ProcessTask.REJECTED
            elif usr.status == ProcessTaskUser.WAITING:
                allAccepted = False

        if allAccepted:
            self.status = ProcessTask.WAITING

    def resignRejectedUser(self, oldUser, newUser):
        tasks = ProcessTaskUser.all(processtask=self).filter(user=oldUser)
        exists = ProcessTaskUser.all(processtask=self).filter(user=newUser).count()
        if exists == 0:
            for task in tasks:
                task.changeUser(newUser)
        else:
            for task in tasks:
                task.delete()
        self.save()

    def move(self, force=False):

        missing = ProcessTaskUser\
            .all(processtask=self, reassigned=False) \
            .filter(finished=False).count()

        if missing == 0:
            self.status=ProcessTask.FINISHED
            self.save()

            # IF WE ARE BEFORE A FORM TASK, UPLOAD THE EXPORT RESULTS PASSING THEM BELOW, bit of a hack
            task = Task.objects.get_subclass(id=self.task.id)

            self.__exportForm(task)

            self.process.move()

        else:
            if force:
                self.__exportForm(Task.objects.get_subclass(id=self.task.id))

    def __exportForm(self, task):
        if task.type() == 'form.FormTask' and task.output_resources:

            exporter = task.get_exporter('xlsx', self)

            export = exporter.export(export_file=True)

            users = self.users()

            if len(users) > 0:
                result = users[0].getResult()

                if result:
                    ex_files = list(result.outputs.all().select_subclasses())

                    for fil in ex_files:
                        if fil.filename==export.filename:
                            result.outputs.remove(fil)

                    result.outputs.add(export)

    def calculateStart(self):
        deps = self.task.dependencies().values_list('id', flat=True)

        pdeps = ProcessTask.all().filter(task__in=deps).order_by('-deadline')

        if pdeps.count() > 0:
            return pdeps[0].deadline

        return self.process.start_date

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
        ...
        :status (smallint): Indicator of the status of the user decision
    '''
    # Status literals, representing the translation to the statuses the process task can be in
    WAITING         = 1
    ACCEPTED        = 2
    REJECTED        = 3
    RUNNING         = 4
    FINISHED        = 5
    CANCELED        = 6
    OVERDUE         = 7
    IMPROVING       = 8

    STATUS          = (
            (WAITING,   'Task is waiting confirmation from user'),
            (ACCEPTED,  'Task was accepted'),
            (REJECTED,  'Task was rejected'),
            (RUNNING, 'Task is running'),
            (FINISHED, 'Task has ended successfully'),
            (CANCELED, 'Task was canceled'),
            (OVERDUE, 'Task has gone over end_date'),
            (IMPROVING, 'Task is running again to be improved')
        )

    user            = models.ForeignKey(User)
    processtask     = models.ForeignKey(ProcessTask)
    reassigned      = models.BooleanField(default=False)
    reassign_date   = models.DateTimeField(null=True, blank=True)
    finished        = models.BooleanField(default=False)
    hash            = models.CharField(max_length=50)
    status          = models.PositiveSmallIntegerField(choices=STATUS, default=WAITING)

    class Meta:
        ordering = ['-processtask__deadline']

    def __unicode__(self):
        return u'%s - %s' % (self.processtask, self.user)

    def requests(self):
        return Request.objects.filter(
            Q(processtaskuser=self)
            | Q(processtaskuser__processtask=self.processtask, public=True)
            )
    def getUser(self):
        return self.user

    def getResult(self):
        from result.models import Result
        try:
            return Result.all(processtaskuser=self)

        except Result.DoesNotExist, IndexError:
            pass

        return None

    def changeUser(self, newUser):
        self.user=User.objects.get(id=newUser)
        self.status=ProcessTaskUser.WAITING
        self.save()

    def reassign(self):
        self.reassigned=True
        self.reassign_date = timezone.now()
        self.save()

        self.processtask.move()

    def assign(self):
        self.reassigned=False
        self.reassign_date = None
        self.save()

        self.processtask.move()

    def finish(self):
        self.finished=True
        self.status=ProcessTaskUser.FINISHED
        self.save()

        self.processtask.move()

    def accept(self):
        self.status=ProcessTaskUser.ACCEPTED
        if (self.processtask.status == ProcessTask.RUNNING):
            self.status=ProcessTaskUser.RUNNING
        self.save()

        self.processtask.refreshState()
        self.processtask.move()

    def reject(self):
        self.status=ProcessTaskUser.REJECTED
        self.save()

        self.processtask.refreshState()
        self.processtask.move()

    @staticmethod
    def all(processtask=None, related=False, finished=None, reassigned=None):
        ''' Returns all valid processtask instances

        '''

        tmp = None
        if related:
            tmp = ProcessTaskUser.objects.select_related('processtask').all()
        else:
            tmp = ProcessTaskUser.objects.all()

        if reassigned != None:
            tmp = tmp.filter(reassigned=reassigned)

        if finished != None:
            tmp = tmp.filter(finished=finished)

        if processtask != None:
            tmp = tmp.filter(processtask=processtask)

        return tmp

@receiver(models.signals.post_save, sender=ProcessTaskUser)
def __generate_ptu_hash(sender, instance, created, *args, **kwargs):
    '''This method uses the post_save signal to automatically generate unique public hashes to be used when referencing an process task user.
    '''
    if created:
        instance.hash=createHash(instance.id)
        instance.save()

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
    public          = models.BooleanField(default=False)
    removed         = models.BooleanField(default=False)

    class Meta:
        ordering = ['-id']

    def process(self):
        return self.processtaskuser.processtask.process.hash

    def task(self):
        return self.processtaskuser.processtask.task.hash

    def resolve(self):
        try:
            if self.response:
                self.resolved=True
            else:
                self.resolved=False
        except RequestResponse.DoesNotExist:
            self.resolved=True

        self.save()

    @staticmethod
    def all(executioner=None, requester=None):
        tmp = Request.objects.filter(removed=False)

        if executioner != None:
            tmp = tmp.filter(processtaskuser__processtask__process__executioner=executioner)

        if requester != None:
            tmp = tmp.filter(processtaskuser__user=requester)

        return tmp

    def __unicode__(self):
        ptask = self.processtaskuser.processtask
        return u"Request for Task %s in Process %s" % (ptask.task, ptask.process)


@receiver(models.signals.post_save, sender=Request)
def __generate_request_hash(sender, instance, created, *args, **kwargs):
    '''This method uses the post_save signal to automatically generate unique public hashes to be used when referencing an request.
    '''
    if created:
        instance.hash=createHash(instance.id)
        instance.save()

class RequestResponse(models.Model):
    '''Represents a request response made over a ProcessTask assignment.

    Each request can have a response, explaining the way the problem was solved.

    Attributes:
        :request (Request): :class:`Request` related with this Request response
        :title (str): Title of the request response message (if any message annexed)
        :message (str): Content of the request response message (if any message annexed)
        :date (datetime): Date the request response was made on
    '''
    # TYPE literals, representing the translation to the type of requests responses available
    SOLVED        = 1
    WONTSOLVE     = 2

    TYPES           = (
            (SOLVED,   'The request was solved'),
            (WONTSOLVE,  'The request won\'t or can\'t be solved'),
        )

    hash            = models.CharField(max_length=50, default="ERROR")
    request         = models.OneToOneField(Request, related_name='response')
    title           = models.CharField(max_length=100, null=True)
    message         = models.TextField(null=True)
    date            = models.DateTimeField(auto_now_add=True)
    status          = models.PositiveSmallIntegerField(choices=TYPES, default=SOLVED)

@receiver(models.signals.post_save, sender=RequestResponse)
def __generate_requestresponse_hash(sender, instance, created, *args, **kwargs):
    '''This method uses the post_save signal to automatically generate unique public hashes to be used when referencing an request response.
    '''
    if created:
        instance.hash=createHash(instance.id)
        instance.save()
