# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('history', '0013_auto_20161024_1912'),
    ]

    operations = [
        migrations.AlterField(
            model_name='history',
            name='event',
            field=models.PositiveSmallIntegerField(default=1, choices=[(1, b'Add'), (2, b'Edit'), (3, b'Delete'), (4, b'Access'), (5, b'Cancel'), (6, b'Done'), (7, b'Approve'), (8, b'Comment'), (9, b'Recover'), (10, b'Late'), (11, b'Run'), (12, b'Remainder'), (13, b'Reject'), (14, b'Invite')]),
        ),
    ]
