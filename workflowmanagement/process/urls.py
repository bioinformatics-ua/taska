# -*- coding: utf-8 -*-
# Copyright (C) 2014 Ricardo F. Gonçalves Ribeiro and Universidade de Aveiro
#
# Authors: Ricardo F. Gonçalves Ribeiro <ribeiro.r@ua.pt>
#
from django.conf.urls import patterns, include, url
from rest_framework import routers


from views.RequestsViewSet import RequestsViewSet
from views.ProcessViewSet import ProcessViewSet
from views.MyAllTasks import MyAllTasks
from views.StatusDetail import StatusDetail
from views.MyTasks import MyTasks
from views.MyRejectedTasks import MyRejectedTasks
from views.MyAllTasks import MyAllTasks
from views.MyCompletedTasks import MyCompletedTasks
from views.MyFutureTasks  import MyFutureTasks
from views.MyTaskDependencies import MyTaskDependencies
from views.MyTaskPreliminary import MyTaskPreliminary
from views.MyTask import MyTask
from views.ResultsPDF import ResultsPDF
from views.ProcessTaskResultExport import ProcessTaskResultExport
from views.MyStudies import MyStudies
from views.MyFinishedStudies import MyFinishedStudies

router = routers.DefaultRouter()
router.register(r'/requests',RequestsViewSet)
router.register(r'', ProcessViewSet)
router.register(r'/my/alltasks', MyAllTasks)
router.register(r'/my/statusdetail/(?P<phash>[^/.]+)', StatusDetail)
#router.register(r'/my/task/(?P<thash>[^/.]+)', MyTask)

# trick to add root to the router generated urls
router_tricks = router.urls #+ [url(r'^', api.root)]

urlpatterns = patterns('',
    url(r'^', include(router_tricks)),
    url(r'^/my/tasks/', MyTasks.as_view()),

    url(r'^/my/rejectedtasks/', MyRejectedTasks.as_view()),
    url(r'^/my/alltasks/', MyAllTasks.as_view({'get': 'list'})),
    url(r'^/my/completedtasks/', MyCompletedTasks.as_view()),
    url(r'^/my/finishedstudies/', MyFinishedStudies.as_view()),
    url(r'^/my/studies/', MyStudies.as_view()),
    url(r'^/my/futuretasks/', MyFutureTasks.as_view()),

    #url(r'^/my/statusdetail/(?P<hash>[^/.]+)/', api.StatusDetail.as_view({'get': 'list'})),

    url(r'^/my/task/(?P<hash>[^/.]+)/dependencies/', MyTaskDependencies.as_view()),
    url(r'^/my/task/(?P<hash>[^/.]+)/preliminary_outputs/', MyTaskPreliminary.as_view()),
    url(r'^/my/task/(?P<hash>[^/.]+)/', MyTask.as_view()),
    #url(r'^/my/task/(?P<hash>[^/.]+)/', MyTask.as_view()),

    url(r'^/processtask/(?P<hash>[0-9a-zA-Z]+)/export/pdf?$'
        , ResultsPDF.as_view(), name='resultspdf'),

    url(r'^/processtask/(?P<hash>[0-9a-zA-Z]+)/export/(?P<mode>[0-9a-zA-Z]+)?$', ProcessTaskResultExport.as_view()),

    #url(r'^/ptu/(?P<hash>[0-9a-zA-Z]+)/redo$', api.ProcessTaskUserRedo.as_view()),

)
