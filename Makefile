build:
	docker build -t bioinformatics-ua/workflow-management:latest .

dev:
	docker build -t bioinformatics-ua/workflow-management:dev .

demo:
	docker build -t bioinformatics-ua/workflow-management:demo .

run:
	sh bin/clean_container.sh && \
	docker-compose up --no-recreate -d

run-dev:
#	sh bin/clean_container_dev.sh && 
	docker-compose -f docker-compose-dev.yml -p taskadev up -d

run-demo:
	docker-compose -f docker-compose-demo.yml -p taskademo up -d

stop:
	docker-compose stop

stop-dev:
	docker-compose -f docker-compose-dev.yml -p taskadev stop

stop-demo:
	docker-compose -f docker-compose-demo.yml -p taskademo stop

clean:
	docker-compose rm -f

clean-dev:
	docker-compose -f docker-compose-dev.yml -p taskadev rm -f

clean-demo:
	docker-compose -f docker-compose-demo.yml -p taskademo rm -f
