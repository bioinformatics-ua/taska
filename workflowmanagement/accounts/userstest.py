from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import authentication_classes, permission_classes

import json

class MyRESTView(APIView):
    authentication_classes = ([])
    permission_classes = ([])

    def get(self, request, *args, **kw):
        data = {
                "community": {"name": "EMIF EHR"},
                "users": [
                      {
                          "firstName": "Joao",
                          "lastName": "Taska",
                          "email": "taska@taska.com",
                          "entry": {"name": "IPCI", "uid": "entry uid"}
                      },
                    {
                        "firstName": "Ze",
                        "lastName": "Manel",
                        "email": "zemanel@mail.com",
                        "entry": {"name": "IPCI", "uid": "entry uid"}
                    }
                   ]
            }
        result = json.loads(json.dumps(data, ensure_ascii=False))
        response = Response(result, status=status.HTTP_200_OK)
        return response