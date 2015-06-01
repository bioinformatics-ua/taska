#!/bin/sh

cd ../workflowmanagement/
celery -A workflowmanagement worker -l info -B
