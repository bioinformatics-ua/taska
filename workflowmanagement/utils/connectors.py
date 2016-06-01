from django.dispatch import receiver
from history.models import History

from django.contrib.auth.models import User

from utils import mailing
from tasks import sendEmail

from process.models import Process, ProcessTask

#@receiver(History.before_send)
#def newHistoryBeforeNotifications(sender, instance, **kwargs):
#    try:
#        tcn = instance.object.__class__.__name__
#        tcn+= dict(instance.__class__.EVENTS)[instance.event].title()
#        tcn = tcn.replace(' ', '')
#        if(tcn == "ProcessTaskAdd"):
#            print "Adiciona os utilizadores numa lista de listas para depois enviar os emails todos"
            #Sugestao criar uma tabela e colocar la as coisas
#        elif (tcn == "ProcessTaskUserRun"):
#            print "Envia email e todos os outros das tarefas de cada elemento"
#            #Consumir as coisas da bd aqui e enviar mails
#            newHistoryNotifications(sender, instance)
#        else:
#            newHistoryNotifications(sender, instance)
#    except:
#        raise

@receiver(History.post_new)
def newHistoryNotifications(sender, instance, **kwargs):
    try:
        tcn = instance.object.__class__.__name__

        #Only for the process in waiting status
        if isinstance(instance.object, Process):
            if(instance.object.status == Process.WAITING):
                tcn+= 'Waiting'

        if isinstance(instance.object, ProcessTask):
            if (instance.object.status == ProcessTask.WAITING_AVAILABILITY):
                tcn += 'Waiting'

        #Event + template
        tcn+= dict(instance.__class__.EVENTS)[instance.event].title()+'Template' 
        tcn = tcn.replace(' ', '')
        print tcn
        try:
            tc = getattr(mailing, tcn)
            tci = None

            if isinstance(instance.object, User):
                # User events always are emailed to everyone involved, no matter their notification preferences, because they are very important
                tci = tc(instance, instance.authorized.all())
            else:
                tci = tc(instance, instance.authorized.filter(profile__notification=True))

            if isinstance(instance.object, Process):
                if (instance.object.status == Process.WAITING):
                    #Usar todos os users envolvidos no process
                    tci = tc(instance, instance.object.getAllUsersEnvolved())

            #sendEmail.apply_async([tci], countdown=5) #Descomentar esta linha
            sendEmail(tci) #Comentar esta

        except AttributeError as e:
            # Silently ignore, when the template is not defined we just don't send the notification
            # i personally  think it makes sense not sending an email notification if theres no template
            # since we cant mandate the history being all notificated (like p.e. access events)
            pass
            
    except:
        raise
        #raise Exception('Error discovering Class template name for %s' % instance.__class__)
