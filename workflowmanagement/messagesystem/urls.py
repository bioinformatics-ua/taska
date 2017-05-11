from django.conf.urls import patterns, include, url
from rest_framework import routers

from messagesystem.views.MessageViewSet import MessageViewSet
from messagesystem.views.MessageListViewSet import MessageListViewSet
from messagesystem.views.MessageListUsersView import MessageListUsersView

router = routers.DefaultRouter()
#router.register(r'', MessageViewSet)

# trick to add root to the router generated urls
router_tricks = router.urls

urlpatterns = patterns('',
    url(r'^', include(router_tricks)),
    url(r'^/$', MessageViewSet.as_view()),
    url(r'^/list/$', MessageListViewSet.as_view()),
    url(r'^/getUsers/$', MessageListUsersView.as_view()),
)
