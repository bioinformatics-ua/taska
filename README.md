Workflow-Management
=======

Workflow Management for Biomedical exploration


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
