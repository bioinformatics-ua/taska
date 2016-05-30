# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('process', '0012_auto_20160407_1632'),
    ]

    operations = [
        migrations.AddField(
            model_name='processtaskuser',
            name='status',
            field=models.PositiveSmallIntegerField(default=1, choices=[(1, b'Task is waiting confirmation from user'), (2, b'Task was accepted'), (3, b'Task was rejected')]),
        ),
    ]
