from django.template.loader import render_to_string
from django.core.mail import send_mail, BadHeaderError, EmailMultiAlternatives
from django.http import HttpResponse, HttpResponseRedirect

from django.conf import settings
import html2text

from process.models import Process, Request, ProcessTaskUser
from history.models import *
from messagesystem.models import Message
#from messagesystem.templates import *


class MailTemplate:
    def __init__(self, instance, destinies):
        self.instance = instance
        self.destinies = destinies
        self.working = False

    def is_valid(self):
        if not self.template:
            raise TemplateDoesNotExist(
                "The template for %s is not defined. 'template' variable must be defined on child class.")

        if not self.subjecttemplate:
            raise TemplateDoesNotExist(
                "The template for %s is not defined. 'subjecttemplate' variable must be defined on child class.")

        self.working = True

    def render(self, interested):
        self.is_valid()
        # Variables
        link_delegate = settings.MAIL_LINKS.get(self.__class__.__name__, None)
        link_open_plataform = settings.BASE_URL
        title = None
        start_date = None
        executioner = None
        task = None
        message_content = None
        sender = None
        user = interested

        if link_delegate != None:
            link_delegate = link_delegate(self.instance.object, interested)

        #History
        if not isinstance(self.instance, Message):
            # When a instance was some observations to add in the email
            try:
                message_content = self.instance.observations
            except AttributeError as e:
                pass

            # Some adjustments for each template
            # Process
            if isinstance(self.instance.object, Process):
                if self.instance.event == History.CANCEL: #process_cancel
                    link_delegate = "MyStudies"
                if self.instance.event == History.DONE: #process_done
                    link_delegate = "MyStudies"

                sender = self.instance.object.executioner

            #ProcessTaskUser
            if isinstance(self.instance.object, ProcessTaskUser):
                executioner = self.instance.object.processtask.process.executioner
                user = self.instance.object.user

            #Request
            if isinstance(self.instance.object, Request):

                task = self.instance.object.processtaskuser.processtask.task.title
                executioner = self.instance.object.processtaskuser.processtask.process.executioner
                user = self.instance.object.processtaskuser.user
                link_delegate = "request/" + self.instance.object.hash

            # Define the first and last name of the send it it exists
            if sender != None:
                if len(sender.first_name) > 0:
                    sender = sender.first_name + " " + sender.last_name

            if len(user.first_name) > 0:
                user = user.first_name + " " + user.last_name

        #Message
        if isinstance(self.instance, Message):
            message_content = self.instance.message.split("\n")

        # Links on mails don't work because the url ends with a /
        if link_open_plataform.endswith('/'):
            link_open_plataform = link_open_plataform[:-1]

        subject = render_to_string(self.subjecttemplate, {
            'object': self.instance.object,
            'taskName': task,
            'instance': self.instance,
            'settings': settings,
            'user': user,
            'title': title
        }).replace('\n', '')
        message = render_to_string(self.template,
                                   {
                                       'object': self.instance.object,
                                       'instance': self.instance,
                                       'settings': settings,
                                       'link_delegate': link_delegate,
                                       'link_open_plataform': link_open_plataform,
                                       'startDate': start_date,
                                       'task': task,
                                       'leaderName' : executioner,
                                       'sender' : sender,
                                       'user': user,
                                       'title': title,
                                       'message': message_content
                                   })
        return (subject, message)

    def send_mail(self):

        if not self.working:
            raise Exception('Must call is_valid() method, before sending mail')

        if not self.destinies:
            raise Exception('No destinies were specified for the email')

        print self.destinies

        for interested in self.destinies:
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