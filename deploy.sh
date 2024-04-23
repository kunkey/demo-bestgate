#!/bin/bash

if [[ -z $1 ]]
then
  echo -e "Run $0 <api|web>"
  exit 1;
else
  docker-compose up -d $1 --build --force-recreate
  sleep 3
  docker-compose ps
fi
