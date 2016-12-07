# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('messagesystem', '0002_remove_message_hash'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='receiver',
            field=models.ManyToManyField(related_name='receiver', to=settings.AUTH_USER_MODEL, blank=True),
        ),
    ]
