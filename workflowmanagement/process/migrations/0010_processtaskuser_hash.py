# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('process', '0009_request_public'),
    ]

    operations = [
        migrations.AddField(
            model_name='processtaskuser',
            name='hash',
            field=models.CharField(default='ERROR', max_length=50),
            preserve_default=False,
        ),
    ]
