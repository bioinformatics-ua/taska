from rest_framework.views import APIView
from rest_framework.response import Response

import requests

class ProxyView(APIView):
    def get(self, request, *args, **kwargs):
        url = request.query_params['url']

        params = {}
        req = requests.get(url, params=params)
        users = req.json()

        return Response({"results": users['users']})