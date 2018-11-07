# <img src="http://bioinformatics.ua.pt/wp-content/uploads/2017/10/Taska-icon.png" height="150"/>
#### A modular and easily extendable system for repeatable workflows


[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://github.com/bioinformatics-ua/taska/tree/master)
 
Task management systems are crucial tools in modern organizations, by simplifying the coordination of teams and their work. Those tools were developed mainly for task scheduling, assignment, follow-up, and accountability. On the other hand, scientific workflow systems also appeared to help putting together a set of computational processes through the pipeline of inputs and outputs from each, creating in the end a more complex processing workflow. However, there is sometimes a lack of solutions that combine both manually operated tasks with automatic processes, in the same workflow system.

TASKA is a web-based platform that incorporates some of the best functionalities of both systems, addressing the collaborative needs of a task manager with well-structured computational pipelines.
The system is currently being used by EMIF (European Medical Information Framework) for the coordination of clinical studies.

A demo installation of TASKA is available online at https://bioinformatics.ua.pt/taska. Please use the following credentials to login:

```
User: demo
Password: demo
```

### Tech

TASKA uses a number of open source projects to work properly, such as:

<pre>
* [ReactJS] - HTML enhanced for web apps!
* [NPM] - The frontend package manager
* [Django] - Web framework python-based
* [Django Rest Framework] - Toolkit for building Web APIs in Django projects
* [PostgreSQL] - The object-relational database management system
* [Docker] - The computer program that performs operating-system-level virtualization
* [Make] -  Utility for building and maintaining groups of programs
</pre>

### Installation

Taska requires Docker, Docker-compose and Make to run.

Install Docker

```
* Full instructions at https://docs.docker.com/install/
```

Install docker-compose

```
* Full instructions at https://docs.docker.com/compose/install/
```

Edit docker-compose.yml with deploy specific details. The varibles that should be configured are the following:

```sh
11  - POSTGRES_USER= user used in the postgreSQL. This user should match wih the user used in row 23
12  - POSTGRES_PASS= password used in the postgreSQL. This password should match wih the user used in row 23
...
10 - "xxxx:8000" change the xxxx for the port to access the container
...      
25 - DOCKER_POSTGRES_USER= user used in the postgreSQL.
26 - DOCKER_POSTGRES_PASS= password used in the postgreSQL. 
27 - DOCKER_POSTGRES_DB= database name
28 - DOCKER_POSTGRES_HOST= host name, default is the container defined in the docker-compose file
29 - DOCKER_POSTGRES_PORT= db container port
...
30 - DOCKER_SECRET=place_your_secret_here # secret salted used on passwords
# The following 5 rows are related with the settings to the email system
31 - EMAIL_USE_TLS=
32 - EMAIL_HOST=
33 - EMAIL_PORT=
34 - EMAIL_HOST_USER=
35 - EMAIL_HOST_PASSWORD=
36 - EMAIL_URL= #System url that will be added in some email templates
37 - DEFAULT_FROM_EMAIL= # the from address in the emails
...
42 - PUBLIC_IP= # the associated domain must be specified, to prevent fake HTTP Host headers
...
45 - BASE_DIR=/taska # if the page wont run on root but on a subdirectory instead it must be specified here
...
48 - RAVEN_URL= # raven url for error logging
```
 
After the costumization of the docker-compose file, it is only necessary perform the following commands to have the installation running. (This process can take a few minutes)

```sh
$ make
$ make run
```

### Scientific contributions


* J. Almeida, R. Ribeiro, and J. L. Oliveira, “A modular workflow management framework”, in Proceedings of the 11th International Conference on Health Informatics (HealthInf 2018), 2018.

* J. R. Almeida, T. M. Godinho, L. Bastião Silva, C. Costa, and J. L. Oliveira, “Services orchestration and workflow management in distributed medical imaging environments”, in Computer-Based Medical Systems (CBMS), 2018 IEEE 31th International Symposium on, IEEE, 2018.


### Core Team
* João Rafael Almeida<sup id="a1">[1](#f1)</sup>
* Ricardo Ribeiro<sup id="a1">[1](#f1)</sup>
* Luís Bastião Silva<sup id="a2">[2](#f2)</sup>
* José Luís Oliveira<sup id="a1">[1](#f1)</sup>



 1. <small id="f1"> University of Aveiro, Dept. Electronics, Telecommunications and Informatics (DETI / IEETA), Aveiro, Portugal </small> [↩](#a1)
 2. <small id="f2"> BMD Software, Aveiro, Portugal  </small> [↩](#a2)

### Partners
* Rosa Gini<sup id="a3">[3](#f3)</sup>
* Giuseppe Roberto<sup id="a3">[3](#f3)</sup>
* Peter Rijnbeek<sup id="a4">[4](#f4)</sup>

3. <small id="f3"> Agenzia Regionale di Sanità della Toscana, Florence, Italy  </small> [↩](#a3)
4. <small id="f4"> Erasmus MC, Rotterdam, Netherlands  </small> [↩](#a4)

---
