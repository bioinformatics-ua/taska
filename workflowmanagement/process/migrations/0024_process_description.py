# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('process', '0023_auto_20170224_1455'),
    ]

    operations = [
        migrations.AddField(
            model_name='process',
            name='description',
            field=models.CharField(default=b'', max_length=2000, null=True),
        ),
    ]
