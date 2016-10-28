from __future__ import absolute_import

from celery import shared_task
from celery.task.schedules import crontab
from celery.decorators import periodic_task

from django.utils import timezone

from django.conf import settings

from history.models import History
from process.models import Process, ProcessTask

@periodic_task(run_every=crontab(minute=settings.LATE_MIN, hour=settings.LATE_HOUR))
def warnLateDeadlines():
    allProcess = Process.allWithDelay()
    for process in allProcess:
        ptasks = ProcessTask.all(process=process).filter(status=ProcessTask.RUNNING, deadline__lt=timezone.now())
        for ptask in ptasks:
            if (((ptask.deadline - timezone.now()).days % process.days_after_delay) == 0):
                pusers = ptask.users()

                for puser in pusers:
                    if (puser.finished == False):
                        History.new(event=History.LATE, actor=puser.user, object=puser, authorized=[puser.user], related=[puser.processtask.process])

@periodic_task(run_every=crontab(minute=settings.LATE_MIN, hour=settings.LATE_HOUR))
def warnBeforeDeadlines():
    allProcess = Process.allWithNotificationBeforeDelay()
    for process in allProcess:
        ptasks = ProcessTask.all(process=process).filter(status=ProcessTask.RUNNING)
        for ptask in ptasks:
            if ((ptask.deadline - timezone.now()).days == process.days_before_delay):
                pusers = ptask.users()

                for puser in pusers:
                    if (puser.finished == False):
                        History.new(event=History.REMAINDER, actor=puser.user, object=puser, authorized=[puser.user],
                                related=[puser.processtask.process])