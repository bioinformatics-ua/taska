# VERSION 0.1 - Production
# DOCKER-VERSION 1.6.2
# To build:
# 1. Install docker (http://docker.io)
# 2. Checkout source: git@github.com:bioinformatics-ua/workflow-management.git
# 3. Build container: make build
# 4. Run container: make run
#FROM    ubuntu:14.04
FROM    python:2.7

ENV     DEBIAN_FRONTEND noninteractive
#################### INSTALL STUFF ############################################
RUN     pip install -U pip

RUN     apt-get update && \
        apt-get install -y -q rabbitmq-server python-dev nginx nodejs npm uwsgi-plugin-python nano && \
        rm -rf /var/cache/apt/archives/* /var/lib/apt/lists/*
#libxml2-dev libxslt1-dev uwsgi


# Add user to run celery as it should not be run as root
RUN     adduser --disabled-password --gecos '' django-deploy

RUN     pip install uwsgi

ADD     ./requirements.txt /requirements.txt
RUN     pip install -r /requirements.txt

ADD     ./bin/nginx-app.conf /etc/nginx/sites-available/default
ADD     ./bin/uwsgi-prod.ini /etc/uwsgi/apps-enabled/workflow.ini
ADD     ./bin/gzip.conf /etc/nginx/conf.d/gzip.conf

ADD     .   /workflow-management

ADD     ./bin/local_settings.py /workflow-management/workflowmanagement/workflowmanagement/local_settings.py

#################### EXPOSE STUFF #############################################

VOLUME  /workflow-management/workflowmanagement/upload

EXPOSE  80
#EXPOSE  8000
CMD     cd /workflow-management/bin && sh run_docker.sh

###############################################################################



