from rest_framework.views import APIView
from rest_framework.response import Response
#from django.views.generic.base import TemplateView

import requests

class ProxyView(APIView):
    def get(self, request, *args, **kwargs):
        print "Entrou no meu proxy"
        url = request.query_params['url']

        params = {}
        req = requests.get(url, params=params)
        #req = requests.get(url, auth=('john', '12345'), params=params) #ERRADISSIMO
        users = req.json()

        return Response({"results": users['users']})