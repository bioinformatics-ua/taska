# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import material.models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('material', '0002_file_filename'),
    ]

    operations = [
        migrations.AddField(
            model_name='resource',
            name='creator',
            field=models.ForeignKey(default=1, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='file',
            name='file',
            field=models.FileField(upload_to=material.models.fileHash),
            preserve_default=True,
        ),
    ]
