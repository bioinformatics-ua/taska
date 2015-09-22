# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0011_task_output_resources'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='effort',
            field=models.IntegerField(default=5),
            preserve_default=False,
        ),
    ]
