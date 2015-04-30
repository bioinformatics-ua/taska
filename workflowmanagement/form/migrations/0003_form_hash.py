# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('form', '0002_form_removed'),
    ]

    operations = [
        migrations.AddField(
            model_name='form',
            name='hash',
            field=models.CharField(default=b'ERROR', max_length=50),
        ),
    ]
