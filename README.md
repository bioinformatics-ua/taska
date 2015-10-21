TASKA
=======

TASKA: A modular and easily extendable system for
repeatable workflows

Taska is an open-source web-based, SaaS proposal for a modular and easily extendable workflow-oriented system designed for managing processes of data extraction  and  data-handling  on  multi-user  environments  where  cooperation matters.

A state-of-the-art default client for the web service API based on reactJS is also included to demonstrate the capabilities of such system.

# Minimal Deploy using docker

- Install Docker

    Full instructions here https://docs.docker.com/installation/

- Install docker-compose

    Full instructions here https://docs.docker.com/compose/install/

- Make the image (from inside the project directory)

    make

- Edit docker-compose.yml with deploy specific details such as SMTP server to use, salt secret, and public url (line 39 - 46)

- To run the image

    make run

- To stop the image

    make stop

- To clear data being kept on the deploy

    make clean
