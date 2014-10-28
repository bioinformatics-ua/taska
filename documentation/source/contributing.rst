Contributing
=======================

Below, follows intruction on how to deploy code in a development environment, similar to the used to develop this code.

Installing development environment under Ubuntu
-----------------------

1. Install pip package

    sudo apt-get install python-pip

2. Install PostgreSQL
    a)  sudo apt-get install postgresql

3. Install virtualenv
    sudo pip install virtualenv

4. Create virtual environment for software using virtualenv
    virtualenv <path_to_folder_to_hold_virtual_environment>

5. Activate virtual environment
    source <path_to_folder_to_hold_virtual_environment>/bin/activate

5. Get project from github
    git clone https://github.com/bioinformatics-ua/workflow-management.git <path_to_folder_to_hold_project>

5. Install necessary packages (inside virtual environment) through pip
    a)  Go to project folder on <path_to_folder_to_hold_project>
    b)  pip install -r requirements.txt

5. Create database on PostgreSQL
    a)  Login on psql as postgre user "sudo su postgres"
    b)  createdb testing
    c)  exit

5. Migrate schema from django to database
    a)  Go to <path_to_folder_to_hold_project>/workflowmanagement
    b)  python manage.py migrate

6. To run server in development mode
    python manage.py runserver
