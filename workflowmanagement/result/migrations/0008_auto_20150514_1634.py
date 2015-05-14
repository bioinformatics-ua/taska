# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('result', '0007_result_outputs'),
    ]

    operations = [
        migrations.AlterField(
            model_name='result',
            name='processtaskuser',
            field=models.OneToOneField(to='process.ProcessTaskUser'),
        ),
    ]
