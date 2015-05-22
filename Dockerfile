# VERSION 0.1
# DOCKER-VERSION 1.6.2
# To build:
# 1. Install docker (http://docker.io)
# 2. Checkout source: git@github.com:bioinformatics-ua/workflow-management.git
# 3. Build container: make build
# 4. Run container: make run
FROM    ubuntu:14.04

ENV PG_VERSION 9.4
ENV DEBIAN_FRONTEND noninteractive
#################### INSTALL STUFF ############################################

# Add postgres to reps
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys B97B0AFCAA1A47F044F244A07FCC7D46ACCC4CF8
RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ precise-pgdg main" > /etc/apt/sources.list.d/pgdg.list
RUN apt-get update && apt-get -y -q install python-software-properties software-properties-common \
    && apt-get -y -q install postgresql-9.3 postgresql-client-9.3 postgresql-contrib-9.3 postgresql-server-dev-9.3

# Install Pip and configure a new virtual environment
RUN     apt-get install -y python-pip

RUN     apt-get install -y -q rabbitmq-server python-dev libxml2-dev libxslt1-dev

USER    postgres

RUN    /etc/init.d/postgresql start &&\
    psql --command "CREATE USER workflow_dev WITH SUPERUSER PASSWORD '12345';" &&\
    createdb -O workflow_dev workflow_dev

# Adjust PostgreSQL configuration so that remote connections to the
# database are possible.
RUN     echo "host all  all    0.0.0.0/0  md5" >> /etc/postgresql/9.3/main/pg_hba.conf

# And add ``listen_addresses`` to ``/etc/postgresql/9.3/main/postgresql.conf``
RUN     echo "listen_addresses='*'" >> /etc/postgresql/9.3/main/postgresql.conf

USER    root

ADD     .   /workflow-management

RUN     pip install -r /workflow-management/requirements.txt

RUN     adduser --disabled-password --gecos '' django-deploy

###############################################################################

#################### COPY STUFF ###############################################

###############################################################################

#################### EXPOSE STUFF #############################################

EXPOSE 5432
EXPOSE  8000

CMD     cd /workflow-management && make run

###############################################################################



