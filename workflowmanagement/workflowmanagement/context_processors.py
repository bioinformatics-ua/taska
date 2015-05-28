from django.conf import settings

def debug(context):
  return {'IS_DEBUG': settings.DEBUG}

def base(context):
  return {'BASE_URL': settings.BASE_URL}
