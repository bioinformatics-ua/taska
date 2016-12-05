# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0003_auto_20150129_1736'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='hash',
            field=models.CharField(default='ERROR', max_length=50),
            preserve_default=False,
        ),
    ]
