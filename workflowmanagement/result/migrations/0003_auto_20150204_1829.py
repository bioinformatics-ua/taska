# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('result', '0002_result_hash'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='result',
            options={'ordering': ['-id']},
        ),
        migrations.AddField(
            model_name='result',
            name='removed',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
