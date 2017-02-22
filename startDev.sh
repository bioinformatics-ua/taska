#!/bin/sh


echo "Starting Celery..."

tmux new -d -s taska -n CELERY 'source ~/taska/env/bin/activate; cd ~/taska/workflowmanagement/; celery -A workflowmanagement worker -l info -B'

echo "Starting NPM..."

tmux new-window -t taska -n NPM 'cd ~/taska/; npm start'

echo "Starting Django..."

tmux new-window -t taska -n DJANGO 'source ~/taska/env/bin/activate; cd ~/taska/workflowmanagement/; python manage.py runserver'


echo "Working..."

tmux a
