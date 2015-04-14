from django.db import models
from django.dispatch import receiver

from model_utils.managers import InheritanceManager

from utils.hashes import createHash

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
    removed         = models.BooleanField(default=False)
    # We need this to be able to properly guess the type
    objects         = InheritanceManager()

    @staticmethod
    def all(subclasses=True):
        ''' Returns all valid resource instances (excluding logically removed)

        '''
        tmp = Resource.objects.filter(removed=False)

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
            serializer = Resource.init_serializer()
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


class File(Resource):
    ''' A type of resource that represents a file.
    '''
    file    = models.FileField(upload_to='file')

    @staticmethod
    def init_serializer(instance=None, data=None, many=False, partial=False):
        ''' This method must override default init_serializer behaviour for a resource.

        Without init_serializer() wouldnt be possible using to process the MTI.
        '''
        from .api import ResourceSerializer
        return ResourceSerializer(instance=instance, data=data, many=many, partial=partial)
    pass

    def __str__(self):
        return self.file.name
