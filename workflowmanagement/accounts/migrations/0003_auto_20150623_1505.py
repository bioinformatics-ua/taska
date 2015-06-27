# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_profile_notification'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='detail_mode',
            field=models.PositiveSmallIntegerField(default=2, choices=[(0, b'Detail views are shown in a popup.'), (1, b'Detail views appear below in the page sequence.'), (2, b'Detail views appear on the left in the page sequence')]),
        ),
    ]
