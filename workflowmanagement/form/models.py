from django.db import models
from django.dispatch import receiver
from django.contrib.auth.models import User

from tasks.models import Task

from result.models import Result
from utils.hashes import createHash


class Form(models.Model):
    '''Holds a form representation.

    This class holds information such as the email notifications preferences and the prefered views.

    Attributes:
        :hash(str): Hash that represents this form publically.
        :creator(User):  :class:`django.contrib.auth.models.User` that created this Form object.
        :schema(str): String containing the Form schema. This should be a valid JSON dump.
        :created_date(datetime): Date of form schema creation.
        :latest_update(datetime): Date of last form schema update.
        :public(boolean): Indication if this object is public or private. Public objects can be seen by all, private objects only by the creator.
        :title(str): Short description of this form.
        :removed(boolean): Indication if this object has been logically removed.

    '''
    hash = models.CharField(max_length=50, default="ERROR")
    creator = models.ForeignKey(User)
    schema = models.TextField(blank=True, default='')
    created_date = models.DateTimeField(auto_now_add=True)
    latest_update = models.DateTimeField(auto_now=True)
    public = models.BooleanField(default=False)
    title = models.CharField(max_length=200)
    removed = models.BooleanField(default=False)

    @staticmethod
    def all(creator=None):
        ''' Returns all valid Form instances (excluding logically removed forms)
            Also allows filtering by creator.
        '''
        tmp = Form.objects.filter(removed=False)

        if creator != None:
            tmp=tmp.filter(creator=creator)
        # else
        return tmp

    def __unicode__(self):
        return u'%s (created on %s)' % (self.title, self.created_date.strftime("%Y-%m-%d %H:%M"))

@receiver(models.signals.post_save, sender=Form)
def __generate_form_hash(sender, instance, created, *args, **kwargs):
    '''This method uses the post_save signal to automatically generate unique public hashes to be used when referencing a form.
    '''
    if created:
        instance.hash=createHash(instance.id)
        instance.save()

class FormTask(Task):
    '''Form-based concretization of a generic task.
    '''
    form = models.ForeignKey(Form)

    @staticmethod
    def init_serializer(instance=None, data=None, many=False, partial=False):
        ''' This method must override default init_serializer behaviour for a task.

        Without init_serializer() wouldnt be possible using to process the MTI.
        '''
        from .api import FormTaskSerializer
        return FormTaskSerializer(instance=instance, data=data, many=many, partial=partial)
    pass

    def get_exporter(self, mode, processtask):
        ''' this method must override default get_exporter behaviour for a task.

        Without it wouldnt be possible to know how to export a Task.
        '''
        from export import FormResultExporter
        return FormResultExporter.getInstance(mode, processtask)

class FormResult(Result):
    '''Form-based concretization of a result for a ProcessTask.
    '''
    answer = models.TextField()

    @staticmethod
    def init_serializer(instance=None, data=None, many=False, partial=False):
        ''' This method must override default init_serializer behaviour for a task.

        Without init_serializer() wouldnt be possible using to process the MTI.
        '''
        from .api import FormResultSerializer
        return FormResultSerializer(instance=instance, data=data, many=many, partial=partial)
    pass
