from django.template.loader import render_to_string
from django.core.mail import send_mail, BadHeaderError, EmailMultiAlternatives
from django.http import HttpResponse, HttpResponseRedirect

from django.conf import settings
import html2text

from process.models import Process

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

        link_delegate = settings.MAIL_LINKS.get(self.__class__.__name__, None)
        link_open_plataform = None
        list_tasks = None

        if isinstance(self.instance.object, Process):
            link_open_plataform = "askForAvailability/"  + self.instance.object.hash
            list_tasks = self.instance.object.tasks()

        if link_delegate != None:
            link_delegate = link_delegate(self.instance.object, interested)

        subject = render_to_string(self.subjecttemplate, {
            'object': self.instance.object,
            'history': self.instance,
            'settings': settings,
            'user': interested
        }).replace('\n', '')
        message = render_to_string(self.template,
                                   {
                                       'object': self.instance.object,
                                       'history': self.instance,
                                       'settings': settings,
                                       'link_delegate': link_delegate,
                                       'user': interested,
                                       'list_tasks': list_tasks,
                                       'link_open_plataform': link_open_plataform
                                   })

        return (subject, message)

    def send_mail(self):
        
        if not self.working:
            raise Exception('Must call is_valid() method, before sending mail')

        if not self.destinies:
            raise Exception('No destinies were specified for the email')

        print self.destinies

        for interested in self.destinies:
            print interested
            print interested.is_staff
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

