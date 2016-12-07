# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import utils.time


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_userrecovery'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userrecovery',
            name='validity',
            field=models.DateTimeField(default=utils.time.nextMonth),
        ),
    ]
