from django.db import models
from django.dispatch import receiver

from django.contrib.auth.models import User

from utils.hashes import createUUID
from utils.time import nextMonth

class Profile(models.Model):
    '''Holds personal details about user preferences.

    This class holds information such as the email notifications preferences and the prefered views.

    Attributes:
        :user(User):  :class:`django.contrib.auth.models.User` that this profile refers to
        :detail_mode(smallint): Prefered mode for detail views
        :notification(boolean): Indication if the `user` should receive notification emails

    '''
    POPUP       = 0
    BELOW       = 1
    LEFT        = 2

    DETAIL_MODES= (
            (POPUP,     'Detail views are shown in a popup.'),
            (BELOW,     'Detail views appear below in the page sequence.'),
            (LEFT,      'Detail views appear on the left in the page sequence')
        )
    user        = models.OneToOneField(User)
    detail_mode = models.PositiveSmallIntegerField(choices=DETAIL_MODES, default=LEFT)
    notification= models.BooleanField(default=True)

    def __unicode__(self):
        ''' Returns a textual representation of the user profile entry.
        '''
        return u"User profile for %s" % self.user

@receiver(models.signals.post_save, sender=User)
def __generate_profile(sender, instance, created, *args, **kwargs):
    '''This method uses the post_save signal to automatically generate a profile for new users.
    '''
    if created:
        try:
            profile = instance.profile

        except Profile.DoesNotExist:
            p = Profile(user=instance)
            p.save()

class UserRecovery(models.Model):
    ''' Holds password recovery entries made by users.

    This class holds information about recovery attempts made by users

    Attributes:
        :user(User):  :class:`django.contrib.auth.models.User` that this requests is made by
        :validity(datetime): Expiration date for this request(after the request is considered invalid)
        :hash(str): Public identificator for this recovery attempt (to be used on urls)
        :used(boolean): Indicates if this recovery attempt has been used by the user to effectively recover the password

    '''
    user    = models.ForeignKey(User)
    validity= models.DateTimeField(default=nextMonth)
    hash    = models.CharField(max_length=50, default=createUUID)
    used    = models.BooleanField(default=False)

    def __unicode__(self):
        ''' Returns a textual representation of the password recovery entry.
        '''
        return u"Password Recovery for %s" % self.user
