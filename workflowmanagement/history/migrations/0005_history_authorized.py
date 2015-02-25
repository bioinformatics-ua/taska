# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('history', '0004_auto_20150204_1652'),
    ]

    operations = [
        migrations.AddField(
            model_name='history',
            name='authorized',
            field=models.ManyToManyField(related_name='authorized', to=settings.AUTH_USER_MODEL),
            preserve_default=True,
        ),
    ]
