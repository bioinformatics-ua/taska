# -*- coding: utf-8 -*-
# Copyright (C) 2014 Ricardo F. Gonçalves Ribeiro and Universidade de Aveiro
#
# Authors: Ricardo F. Gonçalves Ribeiro <ribeiro.r@ua.pt>
#
from django.conf.urls import patterns, include, url
from rest_framework import routers

import api

router = routers.DefaultRouter()

# trick to add root to the router generated urls
router_tricks = router.urls + [url(r'^', api.root)]

urlpatterns = patterns('',
    url(r'^', include(router_tricks)),
)
