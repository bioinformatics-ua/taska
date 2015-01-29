# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='taskdependency',
            options={'verbose_name_plural': 'Task dependencies'},
        ),
        migrations.AddField(
            model_name='task',
            name='removed',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
