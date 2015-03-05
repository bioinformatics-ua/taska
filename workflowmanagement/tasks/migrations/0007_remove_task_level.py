# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0006_task_level'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='task',
            name='level',
        ),
    ]
