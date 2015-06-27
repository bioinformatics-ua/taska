# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('material', '0004_file_linked'),
    ]

    operations = [
        migrations.CreateModel(
            name='ResourceComment',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('create_date', models.DateTimeField(auto_now_add=True)),
                ('latest_update', models.DateTimeField(auto_now=True)),
                ('comment', models.CharField(max_length=2000)),
                ('resource', models.ForeignKey(to='material.Resource')),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
