build:
	docker build -t bioinformatics-ua/workflow-management .

run:
	sh bin/clean_container.sh && \
	docker-compose up --no-recreate

stop:
	docker-compose stop

clean:
	docker-compose rm -f
