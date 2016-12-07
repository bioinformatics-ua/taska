# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('material', '0004_file_linked'),
        ('tasks', '0009_auto_20150324_1947'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='resources',
            field=models.ManyToManyField(to='material.Resource'),
            preserve_default=True,
        ),
    ]
