# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('workflow', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workflowpermission',
            name='workflow',
            field=models.OneToOneField(to='workflow.Workflow'),
            preserve_default=True,
        ),
    ]
