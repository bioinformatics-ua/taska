from __future__ import absolute_import

from celery import shared_task


@shared_task
def sendEmail(template):
    template.is_valid()

    template.send_mail()
