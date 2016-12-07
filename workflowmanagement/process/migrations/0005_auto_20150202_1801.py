# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('process', '0004_auto_20150202_1724'),
    ]

    operations = [
        migrations.AddField(
            model_name='request',
            name='hash',
            field=models.CharField(default=b'ERROR', max_length=50),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='processtaskuser',
            name='reassign_date',
            field=models.DateTimeField(null=True, blank=True),
            preserve_default=True,
        ),
    ]
