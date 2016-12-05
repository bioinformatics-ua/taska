# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('process', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Result',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('comment', models.TextField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='SimpleResult',
            fields=[
                ('result_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='result.Result')),
            ],
            options={
            },
            bases=('result.result',),
        ),
        migrations.AddField(
            model_name='result',
            name='processtaskuser',
            field=models.ForeignKey(to='process.ProcessTaskUser'),
            preserve_default=True,
        ),
    ]
