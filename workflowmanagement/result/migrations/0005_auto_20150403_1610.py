# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('result', '0004_auto_20150403_0105'),
    ]

    operations = [
        migrations.AlterField(
            model_name='result',
            name='hash',
            field=models.CharField(unique=True, max_length=50),
            preserve_default=True,
        ),
    ]
