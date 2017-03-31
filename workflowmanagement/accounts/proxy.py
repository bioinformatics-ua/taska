from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import list_route, detail_route, api_view
from rest_framework import viewsets

import requests

class ProxyView(viewsets.ModelViewSet):
    def readService(self, request, *args, **kwargs):
        url = request.query_params['url']

        params = {}
        req = requests.get(url, params=params)
        return req.json()

    @list_route(methods=['get'])
    def get_users(self, request, *args, **kwargs):
        myjson = self.readService(request)

        #Provisorio, tornar isto dinamico
        result = {
                    "count": len(myjson['users']),
                    "next": None,
                    "previous": None,
                    "results": myjson['users']
                 }

        return Response(result)

    @list_route(methods=['get'])
    def get_questionnaire(self, request, *args, **kwargs):
        myjson = self.readService(request)

        # Provisorio, tornar isto dinamico
        result = {
            "count": len(myjson['community']),
            "next": None,
            "previous": None,
            "results": myjson['community']
        }

        return Response(result)