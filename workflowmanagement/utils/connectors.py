from django.dispatch import receiver
from history.models import History

from utils import mailing
from tasks import sendEmail

@receiver(History.post_new)
def newHistoryNotifications(sender, instance, **kwargs):
    try:
        tcn = instance.object.__class__.__name__
        tcn+= dict(instance.__class__.EVENTS)[instance.event].title()+'Template'

        tcn = tcn.replace(' ', '')
        print tcn
        try:
            tc = getattr(mailing, tcn)
            tci = tc(instance, instance.authorized.filter(profile__notification=True).values_list('email', flat=True))

            sendEmail.apply_async([tci])

        except AttributeError:
            # Silently ignore, when the template is not defined we just don't send the notification
            # i personally  think it makes sense not sending an email notification if theres no template
            # since we cant mandate the history being all notificated (like p.e. access events)
            pass

    except:
        raise
        #raise Exception('Error discovering Class template name for %s' % instance.__class__)
