from django.dispatch import receiver
from history.models import History

from django.contrib.auth.models import User

from utils import mailing
from tasks import sendEmail

from process.models import Process, ProcessTask, Request, ProcessTaskUser
from result.models import Result

@receiver(History.post_new)
def newHistoryNotifications(sender, instance, **kwargs):
    try:
        tcn = buildTemplate(instance)
        print tcn
        try:
            tc = getattr(mailing, tcn)
            tci = defineTci(instance, tc)

            sendEmail.apply_async([tci], countdown=5) #Descomentar esta linha
            #sendEmail(tci) #Usado para enviar emails pelo djnago sem usar o celery

        except AttributeError as e:
            # Silently ignore, when the template is not defined we just don't send the notification
            # i personally  think it makes sense not sending an email notification if theres no template
            # since we cant mandate the history being all notificated (like p.e. access events)
            pass
    except:
        raise
        #raise Exception('Error discovering Class template name for %s' % instance.__class__)



def defineTci(instance, tc):
    tci = None

    if isinstance(instance.object, User):
        # User events always are emailed to everyone involved, no matter their notification preferences, because they are very important
        tci = tc(instance, instance.authorized.all())
    else:
        tci = tc(instance, instance.authorized.filter(profile__notification=True))

    if isinstance(instance.object, Process):
        if (instance.object.status == Process.WAITING):
            # Use all users envolved in the process
            tci = tc(instance, instance.object.getAllUsersEnvolved())

    #if isinstance(instance.object, Result):
     #   if(instance.event == History.ADD):
      #      tci = tc(instance, instance.object.process.executioner)

    if isinstance(instance.object, Request):
        # ADD
        # if autor=user --> receiver=executioner
        # EDIT
        # if autor=executioner --> receiver=user
        # if autor=user --> receiver=executioner
        if (instance.event == 1 or instance.actor == instance.object.processtaskuser.user):
            tci = tc(instance, [instance.object.processtaskuser.processtask.process.executioner])
        elif (instance.actor == instance.object.processtaskuser.processtask.process.executioner):
            tci = tc(instance, [instance.object.processtaskuser.user])

    # When is a processtaskuser instance
    if isinstance(instance.object, ProcessTaskUser):
        if (instance.event == History.REJECT):
            tci = tc(instance, [instance.object.processtask.process.executioner])

    return tci


def buildTemplate(instance):
    tcn = instance.object.__class__.__name__

    # Only for the process in waiting status
    if isinstance(instance.object, Process):
        if (instance.object.status == Process.WAITING):
            tcn += 'Waiting'

    if isinstance(instance.object, ProcessTask):
        if (instance.object.status == ProcessTask.WAITING_AVAILABILITY):
            tcn += 'Waiting'

    # Requests
    if isinstance(instance.object, Request):
        if(instance.object.type == 1): #REASSIGN
            tcn += 'Reassign'
        elif (instance.object.type == 2):  #CLARIFICATION
            tcn += 'Clarification'
        else:
            print("Not implemented yet...")

        if(instance.event == 1 or instance.event == 2): #Only send mails when ADD or EDIT
            if (instance.event == 1 or instance.actor == instance.object.processtaskuser.user):
                tcn += 'Ask'
            elif (instance.actor == instance.object.processtaskuser.processtask.process.executioner):
                tcn += 'Answer'
        tcn += 'Template'
        tcn = tcn.replace(' ', '')

        return tcn;

    # Event + template
    tcn += dict(instance.__class__.EVENTS)[instance.event].title() + 'Template'
    tcn = tcn.replace(' ', '')

    return tcn;