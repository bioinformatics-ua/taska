# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('material', '0003_auto_20150415_1103'),
    ]

    operations = [
        migrations.AddField(
            model_name='file',
            name='linked',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
