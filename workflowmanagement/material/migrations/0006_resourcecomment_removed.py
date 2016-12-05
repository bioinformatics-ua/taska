# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('material', '0005_resourcecomment'),
    ]

    operations = [
        migrations.AddField(
            model_name='resourcecomment',
            name='removed',
            field=models.BooleanField(default=False),
        ),
    ]
