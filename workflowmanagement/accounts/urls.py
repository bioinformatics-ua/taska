# -*- coding: utf-8 -*-
# Copyright (C) 2014 Ricardo F. Gonçalves Ribeiro, Joao Almeida and Universidade de Aveiro
#
# Authors: Ricardo F. Gonçalves Ribeiro <ribeiro.r@ua.pt>
#          Joao Almeida <joao.rafael.almeida@ua.pt>
#
from django.conf.urls import patterns, include, url
from rest_framework import routers

#import api
from views.UserViewSet import UserViewSet

from proxy import ProxyView

router = routers.DefaultRouter()
router.register(r'', UserViewSet)

# trick to add root to the router generated urls
router_tricks = router.urls

urlpatterns = patterns('',
    url(r'^', include(router_tricks)),
    url(r'^/externalservice/getUsers/$', ProxyView.as_view({'get':'get_users'})),
    url(r'^/externalservice/getQuestionnaire/$', ProxyView.as_view({'get':'get_questionnaire'}))
)


