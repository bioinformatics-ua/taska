from django.conf import settings

def debug(context):
  return {'IS_DEBUG': settings.DEBUG}
