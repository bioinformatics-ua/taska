from __future__ import absolute_import

from celery import shared_task
from celery.task.schedules import crontab
from celery.decorators import periodic_task

from django.utils import timezone

from django.conf import settings

from history.models import History
from process.models import ProcessTask

@periodic_task(run_every=crontab(minute=settings.LATE_MIN, hour=settings.LATE_HOUR, day_of_week=settings.LATE_DAY))
def warnLateDeadlines():

    ptasks = ProcessTask.all().filter(status=ProcessTask.RUNNING, deadline__lt=timezone.now())
    for ptask in ptasks:
        pusers = ptask.users()

        for puser in pusers:
            History.new(event=History.LATE, actor=puser.user, object=puser, authorized=[puser.user], related=[puser.processtask.process])