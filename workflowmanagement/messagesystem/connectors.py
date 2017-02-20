from django.dispatch import receiver
from history.models import History

from django.contrib.auth.models import User

from messagesystem import templates
from utils.tasks import sendEmail

from process.models import Process, ProcessTask, Request, ProcessTaskUser
from accounts.models import UserRecovery
from result.models import Result
from messagesystem.models import Message
import time


def newNotification(tcn, sender, instance, **kwargs):
    try:
        print tcn
        tc = getattr(templates, tcn)

        if(isinstance(instance, Message)):
            tci = tc(instance, instance.receiver.all())
        else: #If it's not a message, is a history, so I need to deal with this differently
            tci = defineTci(instance, tc)

        sendEmail.apply_async([tci], countdown=5)  # Descomentar esta linha
        #sendEmail(tci) #Usado para enviar emails pelo djnago sem usar o celery
    except AttributeError as e:
        # print e #Used to help when I want to do debug
        # Silently ignore, when the template is not defined we just don't send the notification
        # i personally  think it makes sense not sending an email notification if theres no template
        # since we cant mandate the history being all notificated (like p.e. access events)
        pass


@receiver(Message.post_new)
def newMessageNotifications(sender, instance, **kwargs):
    try:
        tcn = 'MessageTemplate'

        newNotification(tcn, sender, instance, **kwargs)

    except:
        raise

@receiver(History.post_new)
def newHistoryNotifications(sender, instance, **kwargs):
    try:
        tcn = buildTemplate(instance)

        newNotification(tcn, sender, instance, **kwargs)

    except:
        raise

def defineTci(instance, tc):
    tci = None

    # USER
    if isinstance(instance.object, User) or isinstance(instance.object, UserRecovery):
        # User events always are emailed to everyone involved, no matter their notification preferences, because they are very important
        tci = tc(instance, instance.authorized.all())
    else:
        tci = tc(instance, instance.authorized.filter(profile__notification=True))

    #####################################################################################################
    # PROCESS
    if isinstance(instance.object, Process):
        if (instance.object.status == Process.WAITING):
            # Use all users envolved in the process
            tci = tc(instance, instance.object.getAllUsersEnvolved())

    # PROCESSTASK
    if isinstance(instance.object, ProcessTask):
        tci = tc(instance, instance.object.getAllUsersEnvolved())

        # PROCESSTASKUSER
        # REQUEST
        # RESULT

        # USER RECOVERY

    #Refactor this code
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