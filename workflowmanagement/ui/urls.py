# -*- coding: utf-8 -*-
# Copyright (C) 2014 Ricardo F. Gonçalves Ribeiro and Universidade de Aveiro
#
# Authors: Ricardo F. Gonçalves Ribeiro <ribeiro.r@ua.pt>
#
from django.conf.urls import patterns, include, url

import views

urlpatterns = patterns('',
    url(r'^', views.IndexView.as_view()),
)
