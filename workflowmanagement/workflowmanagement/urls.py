from django.conf.urls import patterns, include, url
from django.contrib import admin
from rest_framework import routers

import api

import workflow
import process
import history

#router = routers.DefaultRouter()
#router.register(r'workflow', include('workflow.urls'))

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'workflowmanagement.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    (r'^grappelli/', include('grappelli.urls')), # grappelli URLS

    url(r'^', include('rest_framework_swagger.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^api/workflow/', include('workflow.urls')),
    url(r'^api/process/', include('process.urls')),
    url(r'^api/history/', include('history.urls')),
    url(r'^api/accounts/', include('accounts.urls')),
    url(r'^api/index', api.root),

)
