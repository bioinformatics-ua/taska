# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('workflow', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Process',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('hash', models.CharField(unique=True, max_length=50)),
                ('start_date', models.DateTimeField(auto_now_add=True)),
                ('end_date', models.DateTimeField()),
                ('status', models.PositiveSmallIntegerField(default=1, choices=[(1, b'Process is running'), (2, b'Process has ended successfully'), (3, b'Process was canceled'), (4, b'Process has gone over end_date')])),
                ('removed', models.BooleanField(default=False)),
                ('executioner', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
                ('workflow', models.ForeignKey(to='workflow.Workflow')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='ProcessTask',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('status', models.PositiveSmallIntegerField(default=1, choices=[(1, b'Task is running'), (2, b'Task has ended successfully'), (3, b'Task was canceled'), (4, b'Task has gone over end_date')])),
                ('deadline', models.DateTimeField()),
                ('process', models.ForeignKey(to='process.Process')),
                ('task', models.ForeignKey(to='tasks.Task')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='ProcessTaskUser',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('reassigned', models.BooleanField(default=False)),
                ('reassign_date', models.DateTimeField(null=True)),
                ('processtask', models.ForeignKey(to='process.ProcessTask')),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Request',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('type', models.PositiveSmallIntegerField(default=2, choices=[(1, b'Ask for reassignment of task'), (2, b'Ask for task clarification')])),
                ('title', models.CharField(max_length=100, null=True)),
                ('message', models.TextField(null=True)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('processtaskuser', models.ForeignKey(to='process.ProcessTaskUser')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
