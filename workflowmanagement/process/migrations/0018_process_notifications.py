# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('process', '0017_auto_20160914_1942'),
    ]

    operations = [
        migrations.AddField(
            model_name='process',
            name='notifications',
            field=models.BooleanField(default=False),
        ),
    ]
