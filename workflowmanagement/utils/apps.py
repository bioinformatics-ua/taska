from django.apps import AppConfig


class UtilsConfig(AppConfig):

    name = 'utils'
    verbose_name = 'Utils'

    def ready(self):
        # import signal handlers
        import utils.connectors
