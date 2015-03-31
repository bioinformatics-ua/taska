# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations

class Migration(migrations.Migration):

    dependencies = [
        ('process', '0005_auto_20150202_1801'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='processtaskuser',
            options={'ordering': ['-processtask__deadline']},
        ),
        migrations.AddField(
            model_name='processtask',
            name='hash',
            field=models.CharField(default='ERROR', max_length=50),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='processtask',
            name='status',
            field=models.PositiveSmallIntegerField(default=1, choices=[(1, b'Task is waiting execution'), (2, b'Task is running'), (3, b'Task has ended successfully'), (4, b'Task was canceled'), (5, b'Task has gone over end_date')]),
            preserve_default=True,
        ),
    ]
