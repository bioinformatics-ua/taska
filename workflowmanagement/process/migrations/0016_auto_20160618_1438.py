# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('process', '0015_auto_20160601_1520'),
    ]

    operations = [
        migrations.AlterField(
            model_name='processtaskuser',
            name='status',
            field=models.PositiveSmallIntegerField(default=1, choices=[(1, b'Task is waiting confirmation from user'), (2, b'Task was accepted'), (3, b'Task was rejected'), (4, b'Task is running'), (5, b'Task has ended successfully'), (6, b'Task was canceled'), (7, b'Task has gone over end_date'), (8, b'Task is running again to be improved')]),
        ),
    ]
