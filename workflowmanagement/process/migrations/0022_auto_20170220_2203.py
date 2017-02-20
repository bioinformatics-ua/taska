# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations

from process.models import *

def update_tasks_status(apps, schema_editor):
    tmpPtu = ProcessTaskUser.objects.all().filter(
        processtask__status = 2,
        status = 1
    )
    for x in tmpPtu:
        x.status = 4
        x.save()

class Migration(migrations.Migration):

    dependencies = [
        ('process', '0021_processtask_allow_sbe'),
    ]

    operations = [
        migrations.RunPython(update_tasks_status)
    ]
