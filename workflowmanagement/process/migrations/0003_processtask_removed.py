# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('process', '0002_auto_20150129_1549'),
    ]

    operations = [
        migrations.AddField(
            model_name='processtask',
            name='removed',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
