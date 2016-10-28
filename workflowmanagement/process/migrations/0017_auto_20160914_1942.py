# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('process', '0016_auto_20160618_1438'),
    ]

    operations = [
        migrations.AddField(
            model_name='process',
            name='days_after_delay',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='process',
            name='days_before_delay',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='process',
            name='num_notification_after',
            field=models.IntegerField(default=0),
        ),
    ]
