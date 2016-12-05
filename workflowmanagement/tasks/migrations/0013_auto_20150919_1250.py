# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0012_task_effort'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='effort',
            field=models.FloatField(),
        ),
    ]
