from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

#from MyProject.MyApp import CalcClass
import json

class MyRESTView(APIView):

    def get(self, request, *args, **kw):
        # Process any get params that you may need
        # If you don't need to process get params,
        # you can skip this part

        #get_arg1 = request.GET.get('arg1', None)
        #get_arg2 = request.GET.get('arg2', None)

        # Any URL parameters get passed in **kw
        #myClass = CalcClass(get_arg1, get_arg2, *args, **kw)
        print "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
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