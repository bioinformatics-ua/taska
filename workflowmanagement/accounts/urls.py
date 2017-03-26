# -*- coding: utf-8 -*-
# Copyright (C) 2014 Ricardo F. Gonçalves Ribeiro and Universidade de Aveiro
#
# Authors: Ricardo F. Gonçalves Ribeiro <ribeiro.r@ua.pt>
#
from django.conf.urls import patterns, include, url
from rest_framework import routers

import api

from userstest import *
from proxy import ProxyView

router = routers.DefaultRouter()
router.register(r'', api.UserViewSet)

# trick to add root to the router generated urls
router_tricks = router.urls

urlpatterns = patterns('',
    url(r'^', include(router_tricks)),
    url(r'^/externalservice/getUsers/$', ProxyView.as_view()),

    #Temp, delete after use it
    url(r'^/m/getExternalUsers/$', MyRESTView.as_view()),
)


