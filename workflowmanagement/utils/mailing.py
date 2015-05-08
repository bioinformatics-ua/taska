from django.template.loader import render_to_string
from django.core.mail import send_mail, BadHeaderError, EmailMultiAlternatives
from django.http import HttpResponse, HttpResponseRedirect

from django.conf import settings
import html2text

class MailTemplate:
    def __init__(self, instance, destinies):
        print "INIT TEMPLATE"
        print instance.object
        self.instance = instance
        self.destinies = destinies

    def render(self):
        if not self.template:
            raise TemplateDoesNotExist("The template for %s is not defined. 'template' variable must be defined on child class.")

        if not self.subjecttemplate:
            raise TemplateDoesNotExist("The template for %s is not defined. 'subjecttemplate' variable must be defined on child class.")

        self.subject = render_to_string(self.subjecttemplate, {
                            'object': self.instance.object,
                            'history': self.instance
                        }).replace('\n', '')
        self.message = render_to_string(self.template, {'object': self.instance.object, 'history': self.instance})

    def send_mail(self):

        if not self.subject:
            raise Exception('No subject was specified for the email')

        if not self.message:
            raise Exception('No message was specified for the email')

        if not self.destinies:
            raise Exception('No destinies were specified for the email')

        if self.subject and self.message and self.destinies:
            msg = EmailMultiAlternatives(
                    self.subject,
                    html2text.html2text(self.message),
                    'Emif Study Manager <%s>' % settings.DEFAULT_FROM_EMAIL,
                    self.destinies
                )
            msg.attach_alternative(self.message, "text/html")

            msg.send()

            return True
        else:
            raise Exception('Error. Make sure you called render() first!')


class ProcessCancelTemplate(MailTemplate):
    subjecttemplate="mail/process_cancel_subject.html"
    template="mail/process_cancel.html"

class ProcessDoneTemplate(MailTemplate):
    subjecttemplate="mail/process_done_subject.html"
    template="mail/process_done.html"

class ProcessTaskAddTemplate(MailTemplate):
    subjecttemplate="mail/processtask_add_subject.html"
    template="mail/processtask_add.html"


class ResultAddTemplate(MailTemplate):
    subjecttemplate="mail/result_add_subject.html"
    template="mail/result_add.html"

class SimpleResultAddTemplate(ResultAddTemplate):
    pass

class FormResultAddTemplate(ResultAddTemplate):
    pass
