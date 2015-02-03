# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('process', '0003_processtask_removed'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='process',
            options={'ordering': ['-id'], 'verbose_name_plural': 'Processes'},
        ),
        migrations.AlterModelOptions(
            name='request',
            options={'ordering': ['-id']},
        ),
        migrations.AddField(
            model_name='request',
            name='removed',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='request',
            name='resolved',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
