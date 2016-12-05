# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        ('history', '0007_auto_20150623_1505'),
    ]

    operations = [
        migrations.CreateModel(
            name='HistoryRelated',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('object_id', models.PositiveIntegerField()),
                ('object_type', models.ForeignKey(to='contenttypes.ContentType')),
            ],
        ),
        migrations.AddField(
            model_name='history',
            name='related',
            field=models.ManyToManyField(related_name='related', to='history.HistoryRelated'),
        ),
    ]
