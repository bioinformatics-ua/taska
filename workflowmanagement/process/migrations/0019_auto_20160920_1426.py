# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('process', '0018_process_notifications'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='process',
            name='num_notification_after',
        ),
        migrations.AddField(
            model_name='process',
            name='send_notification_until',
            field=models.DateTimeField(null=True),
        ),
    ]
