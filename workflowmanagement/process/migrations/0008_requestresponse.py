# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('process', '0007_processtaskuser_finished'),
    ]

    operations = [
        migrations.CreateModel(
            name='RequestResponse',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('hash', models.CharField(default=b'ERROR', max_length=50)),
                ('title', models.CharField(max_length=100, null=True)),
                ('message', models.TextField(null=True)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('status', models.PositiveSmallIntegerField(default=1, choices=[(1, b'The request was solved'), (2, b"The request won't or can't be solved")])),
                ('request', models.OneToOneField(related_name='response', to='process.Request')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
