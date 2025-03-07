#!/usr/bin/env bash

echo "rs.initiate( { _id: \"dev\", version: 1, members: [ { _id: 0, host: \"mongo:27017\" } ] } )" | mongosh -u ${MONGODB_USERNAME:-dbuser} -p ${MONGODB_PASSWORD:-password} --authenticationDatabase admin
