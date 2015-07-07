# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_auto_20150623_1505'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='notification',
            field=models.BooleanField(default=True),
        ),
    ]
