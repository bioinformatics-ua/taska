"""
Django settings for workflowmanagement project.

For more information on this file, see
https://docs.djangoproject.com/en/1.7/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.7/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

def ABS_DIR(rel):
    return os.path.join(BASE_DIR, rel.replace('/', os.path.sep))

BASE_URL = "/"

# swagger settings
SWAGGER_SETTINGS = {
    "exclude_namespaces": ['index'], # List URL namespaces to ignore
    "api_version": '0.1',  # Specify your API's version
    "api_path": "api/",  # Specify the path to your API not a root level
    "enabled_methods": [  # Specify which methods to enable in Swagger UI
        'get',
        'post',
        'put',
        'patch',
        'delete'
    ],
    "api_key": '', # An API key
    "is_authenticated": False,  # Set to True to enforce user authentication,
    "is_superuser": False,  # Set to True to enforce admin only access
    "permission_denied_handler": None, # If user has no permisssion, raise 403 error
}


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.7/howto/developmentloyment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('DOCKER_SECRET', '+g93fk44)x+s%7-$7hb23@saom=#+7@n6lstr8-p7x8z$3#_f9')
# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

if DEBUG:
    STATIC_ROOT = ABS_DIR('COLLECTED/')
    MEDIA_ROOT = ABS_DIR('MEDIA/')

MEDIA_URL = '/media/'

TEMPLATE_DEBUG = True

ALLOWED_HOSTS = []

ADMINS = (
    ('Ricardo Ribeiro', 'ribeiro.r@ua.pt'),
)

# Application definition

INSTALLED_APPS = (
    'grappelli',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    #'oauth2_provider',
    'rest_framework',
    'rest_framework_swagger',
    'utils',
    'material',
    'workflow',
    'tasks',
    'process',
    'result',
    'history',
    'accounts',
    'djangojs',
    'ui',
    'messagesystem',

    # Extra types of task/result
    'form',

    'django_premailer',

    'raven.contrib.django.raven_compat',

    'wkhtmltopdf'
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'workflowmanagement.urls'

WSGI_APPLICATION = 'workflowmanagement.wsgi.application'

# Database
# https://docs.djangoproject.com/en/1.7/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': os.environ.get('DOCKER_POSTGRES_DB', 'workflow_dev'), # Or path to database file if using sqlite3.
        'USER': os.environ.get('DOCKER_POSTGRES_USER', 'workflow_dev'), # Not used with sqlite3.
        'PASSWORD': os.environ.get('DOCKER_POSTGRES_PASS', '12345'), # Not used with sqlite3.
        'HOST': os.environ.get('DOCKER_POSTGRES_HOST', 'localhost'), # Set to empty string for localhost. Not used with sqlite3.
        'PORT': os.environ.get('DOCKER_POSTGRES_PORT', '5432'), # Set to empty string for default. Not used with sqlite3.
        #'AUTOCOMMIT': True,
        #'autocommit': True,
        #'OPTIONS': {
        #    'autocommit': True,
        #},
    },
}

# Internationalization
# https://docs.djangoproject.com/en/1.7/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.7/howto/static-files/

WKHTMLTOPDF_CMD_OPTIONS = {
}

STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',

)

STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.abspath('../node_modules'),
    os.path.abspath('ui/static'),
)


# Template configurations

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    "django.core.context_processors.request",
    'workflowmanagement.context_processors.debug',
    'workflowmanagement.context_processors.base',
    'workflowmanagement.context_processors.raven',
    'dealer.contrib.django.context_processor'
)

'''OAUTH2_PROVIDER = {
    # this is the list of available scopes
    'SCOPES': {'read': 'Read scope', 'write': 'Write scope', 'groups': 'Access to your groups'}
}'''

# framework settings
REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': ('rest_framework.filters.DjangoFilterBackend',),

    'DEFAULT_AUTHENTICATION_CLASSES': (
        #'oauth2_provider.ext.rest_framework.OAuth2Authentication',
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    # Use Django's standard `django.contrib.auth` permissions,
    # or allow read-only access for unauthenticated users.
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'PAGINATE_BY': 13,
    'PAGINATE_BY_PARAM': 'page_size',
    'MAX_PAGINATE_BY': 100
}

# this will be needed on production server
#SESSION_COOKIE_SECURE = True
#CSRF_COOKIE_SECURE = True
TEMPLATE_LOADERS = (

    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',

)
TEMPLATE_DIRS = [
    os.path.join(BASE_DIR, 'tasks/templates'),
    os.path.join(BASE_DIR, 'process/templates'),
    os.path.join(BASE_DIR, 'ui/templates'),
    os.path.join(BASE_DIR, 'utils/templates')
]

MEDIA_ROOT = os.path.join(BASE_DIR, 'upload')

# by default it never expires
SESSION_COOKIE_AGE = 12*3600

EMAIL_URL  = "http://localhost:8000"

# api default
#API_ACTIVATE_URL = "api/account/activate/?email="
API_ACTIVATE_URL = "activate/"

DEFAULT_FROM_EMAIL = 'ribeiro.r@ua.pt'

RAVEN_URL = 'http://98b4d9f7df4740918645908651a72734:f90b482497474347aac765cea8803a09@bioinformatics.ua.pt/sentry/13'

INCLUDE_EMAIL_LINKS = True

def ptask_path(obj, interested):
    task = obj.task.subclass()

    ptu = obj.user(interested)

    if(task.type() == 'tasks.SimpleTask'):
        return BASE_URL+'simpletask/'+ptu.hash

    if(task.type() == 'form.FormTask'):
        return BASE_URL+'formtask/'+ptu.hash

    return None

def ptuask_path(obj, interested):

    task = obj.processtask.task.subclass()

    if(task.type() == 'tasks.SimpleTask'):
        return BASE_URL+'simpletask/'+obj.hash

    if(task.type() == 'form.FormTask'):
        return BASE_URL+'formtask/'+obj.hash

    return None

MAIL_LINKS = {
    "ProcessTaskAddTemplate":  ptask_path,
    "ProcessTaskUserRunTemplate":  ptuask_path,
    "ProcessTaskUserLateTemplate":  ptuask_path,
    "ProcessTaskUserRemainderTemplate":  ptuask_path,
}


try:
    from local_settings import *
except:
    pass


#STATIC_ROOT = BASE_DIR+'/ui/static'
STATIC_URL = BASE_URL+'static/'



RAVEN_CONFIG = {
    'dsn': 'http://98b4d9f7df4740918645908651a72734:f90b482497474347aac765cea8803a09@bioinformatics.ua.pt/sentry/13'  
}

PREMAILER_OPTIONS = dict(base_url=EMAIL_URL, remove_classes=False)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'root': {
        'level': 'WARNING',
        'handlers': ['sentry'],
    },
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s '
                      '%(process)d %(thread)d %(message)s'
        },
    },
    'handlers': {
        'sentry': {
            'level': 'ERROR',
            'class': 'raven.contrib.django.raven_compat.handlers.SentryHandler',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        }
    },
    'loggers': {
        'django.db.backends': {
            'level': 'ERROR',
            'handlers': ['console'],
            'propagate': False,
        },
        'raven': {
            'level': 'DEBUG',
            'handlers': ['console'],
            'propagate': False,
        },
        'sentry.errors': {
            'level': 'DEBUG',
            'handlers': ['console'],
            'propagate': False,
        },
    },
}


# Periodic user updates about late deadlines
LATE_DAY='friday'
LATE_HOUR = 3
LATE_MIN = 0
