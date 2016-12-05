# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('process', '0011_process_title'),
    ]

    operations = [
        migrations.AlterField(
            model_name='processtask',
            name='status',
            field=models.PositiveSmallIntegerField(default=1, choices=[(1, b'Task is waiting execution'), (2, b'Task is running'), (3, b'Task has ended successfully'), (4, b'Task was canceled'), (5, b'Task has gone over end_date'), (6, b'Task is running again to be improved')]),
        ),
    ]
