# -*- coding: utf-8 -*-
# Copyright (C) 2014 Ricardo F. Gonçalves Ribeiro and Universidade de Aveiro
#
# Authors: Ricardo F. Gonçalves Ribeiro <ribeiro.r@ua.pt>
#
from django.conf.urls import patterns, include, url
from rest_framework import routers

import api

router = routers.DefaultRouter()
router.register(r'/requests', api.RequestsViewSet)
router.register(r'', api.ProcessViewSet)


# trick to add root to the router generated urls
router_tricks = router.urls #+ [url(r'^', api.root)]

urlpatterns = patterns('',
    url(r'^', include(router_tricks)),
    url(r'^/my/tasks/', api.MyTasks.as_view()),
    url(r'^/my/futuretasks/', api.MyFutureTasks.as_view()),
    url(r'^/my/task/(?P<hash>[^/.]+)/dependencies/', api.MyTaskDependencies.as_view()),
    url(r'^/my/task/(?P<hash>[^/.]+)/', api.MyTask.as_view()),
    url(r'^/processtask/(?P<hash>[0-9a-zA-Z]+)/export/(?P<mode>[0-9a-zA-Z]+)?$', api.ProcessTaskResultExport.as_view())
)
