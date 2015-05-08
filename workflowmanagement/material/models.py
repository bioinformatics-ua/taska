from django.db import models
from django.dispatch import receiver
from django.contrib.auth.models import User

from model_utils.managers import InheritanceManager

from utils.hashes import createHash

import django.dispatch

# Create your models here.
class Resource(models.Model):
    '''Represents a resource, with importance to a given task or processtask.

    Attributes:
        :id (int): Private sequential identificator
        :start_date (datetime): Creation date
        :latest_update (datetime): Date of latest update
        :removed (boolean): Logical indicator of removal status of this resource

    '''
    hash            = models.CharField(max_length=50)
    ttype           = models.CharField(max_length=100)
    create_date     = models.DateTimeField(auto_now_add=True)
    latest_update   = models.DateTimeField(auto_now=True)
    creator         = models.ForeignKey(User)

    removed         = models.BooleanField(default=False)
    # We need this to be able to properly guess the type
    objects         = InheritanceManager()

    def clone(self):
        new_kwargs = dict([(fld.name, getattr(self, fld.name)) for fld in self._meta.fields if fld.name != self._meta.pk.name]);
        try:
            del new_kwargs['hash']
        except:
            pass

        return self.__class__.objects.create(**new_kwargs)

    def remove(self):
        self.removed=True
        self.save()

    def link(self):
        pass

    @staticmethod
    def all(subclasses=True, creator=None):
        ''' Returns all valid resource instances (excluding logically removed)

        '''
        tmp = Resource.objects.filter(removed=False)

        if creator != None:
            tmp = tmp.filter(creator=creator)

        if subclasses:
            tmp = tmp.select_subclasses()

        return tmp

    def type(self):
        return self._meta.app_label + '.' +self.__class__.__name__

    def to_representation(self, instance):
        serializer = self.get_serializer()

        return serializer.to_representation(instance)

    def to_internal_value(self, instance):
        serializer = self.get_serializer()

        return serializer.to_internal_value(instance)

    @staticmethod
    def init_serializer(instance=None, data=None, many=False, partial=False):
        from .api import ResourceSerializer
        return ResourceSerializer(instance=instance, data=data, many=many, partial=partial)

    def get_serializer(self):
        serializer_name = '__%s'%(self.type())
        serializer = None

        if hasattr(Resource, serializer_name):
            serializer = getattr(Resource, serializer_name)
        else:
            serializer = self.init_serializer()
            setattr(Resource, serializer_name, serializer)

        return serializer

    class Meta:
        ordering = ['-id']


@receiver(models.signals.post_save)
def __generate_resource_hash(sender, instance, created, *args, **kwargs):
    '''This method uses the post_save signal to automatically generate unique public hashes to be used when referencing a file.
    '''
    if not isinstance(instance, Resource):
         return

    if created:
        instance.hash = createHash(instance.id)
        instance.ttype = instance.type()
        instance.save()

### File resource

def fileHash(instance, filename):
    ''' Callable to be called by the FileField, this renames the file to the generic hash
        so we avoid collisions
    '''
    return 'file/{0}/{1}'.format(instance.creator.id, instance.hash)

class File(Resource):
    ''' A type of resource that represents a file.
    '''
    filename = models.CharField(max_length=100)
    file     = models.FileField(upload_to=fileHash)
    # Since file uploads are detached from the actual place where they are used,
    # we must have an indicator that they are already linked or not, so we can
    # periodically remove unlinked temporary files with a background task such as celery(TODO)
    linked   = models.BooleanField(default=False)

    def clone(self):
        f = File(filename=self.filename, file=self.file, linked=self.linked)
        f.save()

        return f

    def remove(self):
        self.linked=False
        self.save()
        super(File, self).remove()

    def link(self):
        linked=True
        self.save()

        super(File, self).link()

    @staticmethod
    def init_serializer(instance=None, data=None, many=False, partial=False):
        ''' This method must override default init_serializer behaviour for a resource.

        Without init_serializer() wouldnt be possible using to process the MTI.
        '''
        from .api import FileSerializer
        return FileSerializer(instance=instance, data=data, many=many, partial=partial)
    pass

    def __str__(self):
        return self.file.name
