build:
	docker build -t bioinformatics-ua/workflow-management .

run:
	sudo -u postgres /etc/init.d/postgresql start && \
	sudo -u root /etc/init.d/rabbitmq-server start && \
	cd /workflow-management/workflowmanagement && \
	python manage.py migrate --noinput && \
	echo "from django.contriauth.models import User; user = User.objects.create_superuser('admin', 'admin@example.com', '12345'); user.save()" | ./manage.py shell && \
	sudo -u django-deploy celery -A workflowmanagement worker -l info &
	cd /workflow-management/workflowmanagement && \
	sudo -u django-deploy python manage.py runserver 0:8000

run-container:
	docker run -p 8000:8000 bioinformatics-ua/workflow-management
