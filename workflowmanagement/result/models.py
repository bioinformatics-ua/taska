from django.db import models
from django.dispatch import receiver

from process.models import ProcessTaskUser
from model_utils.managers import InheritanceManager

from utils.hashes import createHash

class Result(models.Model):
    ''' Generic representation of a result for a given ProcessTask, given by a given User.

    This generic object is generated when a user completes a given ProcessTask.

    Attributes:
        :processtaskuser (ProcessTaskUser)::class:`process.models.ProcessTaskUser` related with this result
        :date (datetime): Timestamp of this result generation
        :comment (str): Other relevant comments from the executioner about this task.
    '''
    processtaskuser = models.ForeignKey(ProcessTaskUser)
    date            = models.DateTimeField(auto_now_add=True)
    comment         = models.TextField()
    hash            = models.CharField(max_length=50)

    removed         = models.BooleanField(default=False)

    # We need this to be able to properly guess the type
    objects         = InheritanceManager()

    class Meta:
        ordering = ['-id']

    def process(self):
        return self.processtaskuser.processtask.process.hash

    def task(self):
        return self.processtaskuser.processtask.task.hash

    def user(self):
        return self.processtaskuser.user.id

    def type(self):
        return self._meta.app_label + '.' +self.__class__.__name__

    @staticmethod
    def all(owner=None):

        tmp = Result.objects.filter(removed=False)

        if owner != None:
            tmp=tmp.filter(processtaskuser__processtask__process__executioner=owner)

        return tmp.select_subclasses()

    @staticmethod
    def init_serializer(instance=None, data=None, many=False, partial=False):
        from .api import ResultSerializer
        return ResultSerializer(instance=instance, data=data, many=many, partial=partial)

    def get_serializer(self):
        serializer_name = '__%s'%(self.type())
        serializer = None
        if hasattr(Result, serializer_name):
            serializer = getattr(Result, serializer_name)
        else:
            serializer = Result.init_serializer()
            setattr(Result, serializer_name, serializer)

        return serializer

    def to_representation(self, instance):
        serializer = self.get_serializer()

        return serializer.to_representation(instance)

    def to_internal_value(self, instance):
        serializer = self.get_serializer()

        return serializer.to_internal_value(instance)

    def __str__(self):
        ptask = self.processtaskuser.processtask
        return "Result for Task %s in Process %s" % (ptask.task.__str__(), ptask.process.__str__())

@receiver(models.signals.post_save)
def __generate_result_hash(sender, instance, created, *args, **kwargs):
    '''This method uses the post_save signal to automatically generate unique public hashes to be used when referencing an result.
    '''
    if not isinstance(instance, Result):
         return

    if created:
        instance.hash=createHash(instance.id)
        instance.ttype = instance.type()
        instance.save()


class SimpleResult(Result):
    '''Basic concretization of a result for a ProcessTask.

    This is a basic implementation of the generic result model, and has no extra behaviour beyond the one provided by the generic model.
    Is meant to be used for simple check tasks, that are executed outside of the system and can not be ascertained through it.
    '''
    @staticmethod
    def init_serializer(instance=None, data=None, many=False, partial=False):
        ''' This method must override default init_serializer behaviour for a task.

        Without init_serializer() wouldnt be possible using to process the MTI.
        '''
        from .api import SimpleResultSerializer
        return SimpleResultSerializer(instance=instance, data=data, many=many, partial=partial)
    pass
