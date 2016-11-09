from django.conf.urls import patterns, include, url
from rest_framework import routers

from messagesystem.views.MessageViewSet import MessageViewSet

router = routers.DefaultRouter()
#router.register(r'', MessageViewSet)

# trick to add root to the router generated urls
router_tricks = router.urls

urlpatterns = patterns('',
    url(r'^', include(router_tricks)),
    url(r'^/create/(?P<hash>[^/.]+)/$', MessageViewSet.as_view()), #(?P<hash>[^/.]+)/
    url(r'^/create/$', MessageViewSet.as_view()),
)
