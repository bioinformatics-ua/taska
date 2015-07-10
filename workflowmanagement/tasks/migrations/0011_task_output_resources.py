# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0010_task_resources'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='output_resources',
            field=models.BooleanField(default=True),
        ),
    ]
