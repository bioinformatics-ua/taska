# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('process', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='process',
            options={'verbose_name_plural': 'Processes'},
        ),
        migrations.AlterField(
            model_name='process',
            name='end_date',
            field=models.DateTimeField(null=True),
            preserve_default=True,
        ),
    ]
