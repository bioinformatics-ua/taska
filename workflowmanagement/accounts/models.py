from django.db import models
from django.dispatch import receiver

from django.contrib.auth.models import User

class Profile(models.Model):
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
        return u"User profile for %s" % self.user

@receiver(models.signals.post_save, sender=User)
def __generate_profile(sender, instance, created, *args, **kwargs):
    '''This method uses the post_save signal to automatically generate unique public hashes to be used when referencing an process.
    '''
    if created:
        try:
            profile = instance.profile

        except Profile.DoesNotExist:
            p = Profile(user=instance)
            p.save()
