# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('process', '0010_processtaskuser_hash'),
    ]

    operations = [
        migrations.AddField(
            model_name='process',
            name='title',
            field=models.CharField(max_length=200, null=True),
        ),
    ]
