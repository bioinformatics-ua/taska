# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('material', '0004_file_linked'),
        ('result', '0006_auto_20150409_1257'),
    ]

    operations = [
        migrations.AddField(
            model_name='result',
            name='outputs',
            field=models.ManyToManyField(to='material.Resource'),
            preserve_default=True,
        ),
    ]
