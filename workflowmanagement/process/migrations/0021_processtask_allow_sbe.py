# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('process', '0020_remove_process_notifications'),
    ]

    operations = [
        migrations.AddField(
            model_name='processtask',
            name='allow_sbe',
            field=models.BooleanField(default=False),
        ),
    ]
