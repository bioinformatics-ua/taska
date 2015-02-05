# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('result', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='result',
            name='hash',
            field=models.CharField(default='ERR', unique=True, max_length=50),
            preserve_default=False,
        ),
    ]
