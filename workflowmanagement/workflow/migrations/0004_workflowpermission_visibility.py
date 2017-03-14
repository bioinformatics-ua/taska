# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('workflow', '0003_auto_20150130_1653'),
    ]

    operations = [
        migrations.AddField(
            model_name='workflowpermission',
            name='visibility',
            field=models.PositiveSmallIntegerField(default=1, choices=[(1, b'Workflow to works in TASKA'), (2, b'Workflow to works with MONTRA')]),
        ),
    ]
