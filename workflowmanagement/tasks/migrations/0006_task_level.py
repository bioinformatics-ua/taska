# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0005_task_ttype'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='level',
            field=models.IntegerField(default=1),
            preserve_default=False,
        ),
    ]
