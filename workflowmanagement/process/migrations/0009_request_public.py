# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('process', '0008_requestresponse'),
    ]

    operations = [
        migrations.AddField(
            model_name='request',
            name='public',
            field=models.BooleanField(default=False),
        ),
    ]
