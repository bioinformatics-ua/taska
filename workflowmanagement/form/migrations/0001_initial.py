# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('tasks', '0010_task_resources'),
        ('result', '0007_result_outputs'),
    ]

    operations = [
        migrations.CreateModel(
            name='Form',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('schema', models.TextField(default=b'', blank=True)),
                ('created_date', models.DateTimeField(auto_now_add=True)),
                ('latest_update', models.DateTimeField(auto_now=True)),
                ('public', models.BooleanField(default=False)),
                ('title', models.CharField(max_length=200)),
                ('creator', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='FormResult',
            fields=[
                ('result_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='result.Result')),
                ('answer', models.TextField()),
            ],
            bases=('result.result',),
        ),
        migrations.CreateModel(
            name='FormTask',
            fields=[
                ('task_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='tasks.Task')),
                ('form', models.ForeignKey(to='form.Form')),
            ],
            bases=('tasks.task',),
        ),
    ]
