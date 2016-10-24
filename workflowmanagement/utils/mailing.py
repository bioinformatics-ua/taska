from django.template.loader import render_to_string
from django.core.mail import send_mail, BadHeaderError, EmailMultiAlternatives
from django.http import HttpResponse, HttpResponseRedirect

from django.conf import settings
import html2text

from process.models import Process, Request, ProcessTaskUser
from history.models import *

class MailTemplate:
    def __init__(self, instance, destinies):
        self.instance = instance
        self.destinies = destinies
        self.working=False

    def is_valid(self):
        if not self.template:
            raise TemplateDoesNotExist("The template for %s is not defined. 'template' variable must be defined on child class.")

        if not self.subjecttemplate:
            raise TemplateDoesNotExist("The template for %s is not defined. 'subjecttemplate' variable must be defined on child class.")

        self.working=True

    def render(self, interested):
        self.is_valid()

        #Variables
        link_delegate = settings.MAIL_LINKS.get(self.__class__.__name__, None)
        link_open_plataform = settings.BASE_URL
        list_tasks = None
        title = None
        start_date = None
        executioner = None
        task = None

        if link_delegate != None:
            link_delegate = link_delegate(self.instance.object, interested)

        if len(interested.first_name) > 0:
            user = interested.first_name + " " + interested.last_name
        else:
            user = interested

        #When is a processtaskuser instance
        if isinstance(self.instance.object, ProcessTaskUser):
            if(self.instance.event == History.REJECT):
                executioner = self.instance.object.processtask.process.executioner
                if len(self.instance.object.user.first_name) > 0:
                    user = self.instance.object.user.first_name + " " + self.instance.object.user.last_name
                else:
                    user = self.instance.object.user

        #When is a process instance
        if isinstance(self.instance.object, Process):
            if(self.instance.object.status == Process.WAITING):
                list_tasks = self.instance.object.tasks().filter(processtaskuser__user=interested)
            title = self.instance.object.title
            start_date = self.instance.object.start_date
            executioner = self.instance.object.executioner

        # When is a request instance
        if isinstance(self.instance.object, Request):
            task = self.instance.object.processtaskuser.processtask.task.title
            executioner = self.instance.object.processtaskuser.processtask.process.executioner
            user = self.instance.object.processtaskuser.user.first_name + " " + self.instance.object.processtaskuser.user.last_name
            link_open_plataform += "request/"+ self.instance.object.hash

        subject = render_to_string(self.subjecttemplate, {
            'object': self.instance.object,
            'studyName': title,
            'taskName': task,
            'history': self.instance,
            'settings': settings,
            'user': user
        }).replace('\n', '')
        message = render_to_string(self.template,
                                   {
                                       'object': self.instance.object,
                                       'studyName': title,
                                       'history': self.instance,
                                       'settings': settings,
                                       'link_delegate': link_delegate,
                                       'user': user,
                                       'list_tasks': list_tasks,
                                       'link_open_plataform': link_open_plataform,
                                       'startDate': start_date,
                                       'leaderName': executioner,
                                       'task':task,
                                       'observations': self.instance.observations
                                   })

        return (subject, message)

    def send_mail(self):
        
        if not self.working:
            raise Exception('Must call is_valid() method, before sending mail')

        if not self.destinies:
            raise Exception('No destinies were specified for the email')

        print self.destinies

        for interested in self.destinies:
            #print interested
            #print interested.is_staff
            (subject, message) = self.render(interested)

            msg = EmailMultiAlternatives(
                    subject,
                    html2text.html2text(message),
                    'Taska <%s>' % settings.DEFAULT_FROM_EMAIL,
                    [interested.email]
                )
            msg.attach_alternative(message, "text/html")

            msg.send()

        return True


class ProcessCancelTemplate(MailTemplate):
    subjecttemplate="mail/process_cancel_subject.html"
    template="mail/process_cancel.html"

class ProcessDoneTemplate(MailTemplate):
    subjecttemplate="mail/process_done_subject.html"
    template="mail/process_done.html"

class ProcessTaskAddTemplate(MailTemplate):
    subjecttemplate="mail/processtask_add_subject.html"
    template="mail/processtask_add.html"

class ProcessWaitingAddTemplate(MailTemplate):
    subjecttemplate="mail/process_confirmation_subject.html"
    template="mail/process_confirmation.html"

class ProcessTaskUserRejectTemplate(MailTemplate):
    subjecttemplate="mail/processtaskuser_reject_subject.html"
    template="mail/processtaskuser_reject.html"

class RequestClarificationAskTemplate(MailTemplate):
    subjecttemplate="mail/request_clarification_add_subject.html"
    template="mail/request_clarification_add.html"

class RequestReassignAskTemplate(MailTemplate):
    subjecttemplate="mail/request_reassign_add_subject.html"
    template="mail/request_reassign_add.html"

class RequestClarificationAnswerTemplate(MailTemplate):
    subjecttemplate="mail/request_clarification_edit_subject.html"
    template="mail/request_clarification_edit.html"

class RequestReassignAnswerTemplate(MailTemplate):
    subjecttemplate="mail/request_reassign_edit_subject.html"
    template="mail/request_reassign_edit.html"



class ProcessTaskUserRemainderTemplate(MailTemplate):
    subjecttemplate="mail/processtaskuser_remainder_subject.html"
    template="mail/processtaskuser_remainder.html"

class ProcessTaskUserLateTemplate(MailTemplate):
    subjecttemplate="mail/processtaskuser_late_subject.html"
    template="mail/processtaskuser_late.html"

class ProcessTaskUserRunTemplate(MailTemplate):
    subjecttemplate="mail/processtaskuser_run_subject.html"
    template="mail/processtaskuser_run.html"

class ResultAddTemplate(MailTemplate):
    subjecttemplate="mail/result_add_subject.html"
    template="mail/result_add.html"

class SimpleResultAddTemplate(ResultAddTemplate):
    pass

class FormResultAddTemplate(ResultAddTemplate):
    pass

class UserAddTemplate(MailTemplate):
    subjecttemplate="mail/user_add_subject.html"
    template="mail/user_add.html"

class UserApproveTemplate(MailTemplate):
    subjecttemplate="mail/user_approve_subject.html"
    template="mail/user_approve.html"

class UserRecoveryRecoverTemplate(MailTemplate):
    subjecttemplate="mail/userrecovery_recover_subject.html"
    template="mail/userrecovery_recover.html"

