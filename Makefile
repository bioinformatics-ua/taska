build:
	docker build -t bioinformatics-ua/workflow-management:latest .

dev:
	docker build -t bioinformatics-ua/workflow-management:dev .

run:
	sh bin/clean_container.sh && \
	docker-compose up --no-recreate -d

run-dev:
#	sh bin/clean_container_dev.sh && 
	docker-compose -f docker-compose-dev.yml -p taskadev up -d

stop:
	docker-compose stop

stop-dev:
	docker-compose -f docker-compose-dev.yml -p taskadev stop

clean:
	docker-compose rm -f

clean-dev:
	docker-compose -f docker-compose-dev.yml -p taskadev rm -f
