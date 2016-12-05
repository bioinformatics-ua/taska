# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('process', '0006_auto_20150331_1529'),
    ]

    operations = [
        migrations.AddField(
            model_name='processtaskuser',
            name='finished',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
