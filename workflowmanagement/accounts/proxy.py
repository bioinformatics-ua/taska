from rest_framework.views import APIView
from rest_framework.response import Response
#from django.views.generic.base import TemplateView

import requests

class ProxyView(APIView):
    def get(self, request, *args, **kw):
        url = 'http://127.0.0.1:8001/api/account/m/getExternalUsers/'

        params = {}
        req = requests.get(url, auth=('john', '12345'), params=params)
        users = req.json()

        return Response({'users': users['users']})