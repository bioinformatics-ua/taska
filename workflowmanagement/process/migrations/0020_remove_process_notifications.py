# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('process', '0019_auto_20160920_1426'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='process',
            name='notifications',
        ),
    ]
