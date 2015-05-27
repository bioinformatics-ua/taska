build:
	docker build -t bioinformatics-ua/workflow-management .

run:
	docker-compose up --no-recreate

stop:
	docker-compose stop

clean:
	docker-compose rm -f
