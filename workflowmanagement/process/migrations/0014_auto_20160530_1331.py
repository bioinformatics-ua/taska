# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('process', '0013_processtaskuser_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='process',
            name='status',
            field=models.PositiveSmallIntegerField(default=1, choices=[(1, b'Process is running'), (2, b'Process has ended successfully'), (3, b'Process was canceled'), (4, b'Process has gone over end_date'), (5, b'Process is waiting for users availability')]),
        ),
        migrations.AlterField(
            model_name='processtask',
            name='status',
            field=models.PositiveSmallIntegerField(default=1, choices=[(1, b'Task is waiting execution'), (2, b'Task is running'), (3, b'Task has ended successfully'), (4, b'Task was canceled'), (5, b'Task has gone over end_date'), (6, b'Task is running again to be improved'), (7, b'Task is waiting for users availability')]),
        ),
    ]
