# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('workflow', '0002_auto_20150129_1549'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='workflow',
            options={'ordering': ['-id']},
        ),
    ]
