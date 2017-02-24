# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from process.models import *

def update_tasks_status(apps, schema_editor):
    #Change acepted user tasks to running state if the task is in running state
    tmpPtu = ProcessTaskUser.objects.all().filter(
        processtask__status = 2,
        status = 2
    )
    for x in tmpPtu:
        x.status = 4
        x.save()

    #Change to waiting all the tasks that are acepted or waiting
    tmpPtu = ProcessTaskUser.objects.all().filter(
        Q(processtask__status=1),
        Q(status=2) | Q(status=1)
    )
    for x in tmpPtu:
        x.status = 1
        x.save()

    #Change tasks thate are in improvment but with the wrong status
    tmpPtu = ProcessTaskUser.objects.all().filter(
        processtask__status=5,
        status=2,
        finished=False
    )
    for x in tmpPtu:
        x.status = 8
        x.save()

class Migration(migrations.Migration):

    dependencies = [
        ('process', '0022_auto_20170220_2203'),
    ]

    operations = [
        migrations.RunPython(update_tasks_status)
    ]
