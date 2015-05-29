#!/bin/sh
export TERM=xterm
ln -s /usr/bin/nodejs /usr/bin/node

cp /nginx-app.conf.template /etc/nginx/sites-available/default
sed -i -e "s:{BASE_DIR_PLACEHOLDER}:$BASE_DIR:g" /etc/nginx/sites-available/default

/etc/init.d/rabbitmq-server start
service nginx start

check_up() {
    service=$1
    host=$2
    port=$3

    max=13 # 1 minute

    counter=1
    while true;do
        python -c "import socket;s = socket.socket(socket.AF_INET, socket.SOCK_STREAM);s.connect(('$host', $port))" \
        >/dev/null 2>/dev/null && break || \
        echo "Waiting that $service on $host:${port} is started (sleeping for 5) on counter ${counter}"

        if [ $counter = $max ]; then
            echo "Could not connect to ${service} after some time"
            echo "Investigate locally the logs with fig logs"
            exit 1
        fi

        sleep 5

        counter=$(expr "$counter" + "1")
    done
}

echo_prop() {
    if [ -z "$1" ]; then
        echo "$2"
    else
        echo "$1"
    fi
}

check_up "postgres" db 5432

cd /workflow-management

# get node modules
npm install
# locking browserify and watchify versions, as I don't know if they will work properly otherwise
npm install browserify@9.0.3 -g
npm install watchify@2.6.0 -g
npm install uglifyjs@2.4.10 -g

# generate small production js/css files (as development ones are really big)
npm run prod

cd /workflow-management/workflowmanagement

python manage.py migrate --noinput

python manage.py adduser admin admin@example.com 12345 y

python manage.py collectstatic --noinput

su django-deploy

cd /workflow-management/workflowmanagement



echo "------------------------------------------"
echo "---- Starting celery ------ "
C_FORCE_ROOT=True celery -A workflowmanagement worker -l info &

echo "------------------------------------------"
echo "---- Starting uwsgi ------ "
uwsgi --ini /etc/uwsgi/apps-enabled/workflow.ini
#python manage.py runserver 0:8000
