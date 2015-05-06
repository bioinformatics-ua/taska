from __future__ import absolute_import

from celery import shared_task


@shared_task
def sendEmail(template):
    template.render()

    template.send_mail()
