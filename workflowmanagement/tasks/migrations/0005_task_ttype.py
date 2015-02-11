# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0004_task_hash'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='ttype',
            field=models.CharField(default='task.Task', max_length=100),
            preserve_default=False,
        ),
    ]
