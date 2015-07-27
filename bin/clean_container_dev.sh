#!/bin/sh

OLD_CONTAINER=$(docker ps -a | grep bioinformatics-ua/workflow-management:dev | awk '{print $1}')

if [ -z $OLD_CONTAINER ]; then
    echo 'No old container to clean'
else
    echo 'Cleaning old container before running'
    docker rm $OLD_CONTAINER
fi
