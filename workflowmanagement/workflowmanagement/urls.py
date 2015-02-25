from django.conf.urls import patterns, include, url
from django.contrib import admin
from rest_framework import routers

import api

import workflow
import process
import history

from tasks.api import TaskDependenciesView

#router = routers.DefaultRouter()
#router.register(r'workflow', include('workflow.urls'))

urlpatterns = patterns('',
    (r'^grappelli/', include('grappelli.urls')), # grappelli URLS

    url(r'^swagger/', include('rest_framework_swagger.urls')),

    url(r'^admin/', include(admin.site.urls)),

    # oauth2 provider
    url(r'^o/', include('oauth2_provider.urls', namespace='oauth2_provider')),

    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^api/workflow', include('workflow.urls')),
    url(r'^api/process', include('process.urls')),
    url(r'^api/history', include('history.urls')),
    url(r'^api/account', include('accounts.urls')),
    url(r'^api/result', include('result.urls')),

    # For some ridiculous reason the rest routers remove my ability to set post methods... after the ones defined by it on the same domain
    # Since i will have different kinds of authentication in this and the router, i cant add it as a list_route
    # i will have to think of a better approach
    url(r'^api/task/__possibledeps/$', TaskDependenciesView.as_view(), name='__possibledeps'),

    url(r'^api/task', include('tasks.urls')),
    url(r'^api/index', api.root),

    url(r'^', include('ui.urls')),
)
