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
#RUN     pip install -U pip

RUN     apt-get update && \
        apt-get install -y -q rabbitmq-server python-dev nginx nodejs wget wkhtmltopdf npm uwsgi-plugin-python nano libfontconfig && \
        rm -rf /var/cache/apt/archives/* /var/lib/apt/lists/*
#libxml2-dev libxslt1-dev uwsgi


# Add user to run celery as it should not be run as root
RUN     adduser --disabled-password --gecos '' django-deploy

RUN     pip install uwsgi

ADD     ./requirements.txt /requirements.txt
RUN     pip install -r /requirements.txt

ADD     ./bin/nginx-app.conf /nginx-app.conf.template
#ADD     ./bin/nginx-app.conf /etc/nginx/sites-available/default
ADD     ./bin/uwsgi-prod.ini /etc/uwsgi/apps-enabled/workflow.ini
ADD     ./bin/gzip.conf /etc/nginx/conf.d/gzip.conf

ADD     .   /workflow-management

ADD     ./bin/local_settings.py /workflow-management/workflowmanagement/workflowmanagement/local_settings.py

RUN     apt-get update && \
        apt-get install -y -q xfonts-75dpi && \
        rm -rf /var/cache/apt/archives/* /var/lib/apt/lists/*

RUN     wget https://downloads.wkhtmltopdf.org/0.12/0.12.2.1/wkhtmltox-0.12.2.1_linux-jessie-amd64.deb && \
        dpkg -i wkhtmltox-0.12.2.1_linux-jessie-amd64.deb

#RUN     mv /usr/bin/wkhtmltopdf /usr/bin/wkhtmltopdf2  && \
#        echo '/usr/bin/xvfb-run --server-args="-screen 0, 1024x768x24" /usr/bin/wkhtmltopdf2 $*' > /usr/bin/wkhtmltopdf.sh && \
#        chmod a+rx /usr/bin/wkhtmltopdf.sh && \
#        ln -s /usr/bin/wkhtmltopdf.sh /usr/bin/wkhtmltopdf

#################### EXPOSE STUFF #############################################

VOLUME  /workflow-management/workflowmanagement/upload

EXPOSE  80
#EXPOSE  8000
CMD     cd /workflow-management/bin && sh run_docker.sh

###############################################################################



