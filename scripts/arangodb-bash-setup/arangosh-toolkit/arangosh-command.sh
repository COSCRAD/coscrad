#!/bin/bash

set -e

# Register COSCRAD_ENVIRONMENT mode
if [ $1 ]; then
  COSCRAD_ENVIRONMENT=$1
  export COSCRAD_ENVIRONMENT;
else
  echo "No COSCRAD Environment mode input argument supplied.  Accepted: development | test | staging | production";
  exit;
fi

echo $'\n';
printenv | grep "COSCRAD_ENVIRONMENT";

echo $PWD;

if [ $2 ]; then
  ARANGOSH_COMMAND=$2
  ARANGOSH_SCRIPT="./scripts/arangodb-bash-setup/arangosh-toolkit/js/$ARANGOSH_COMMAND.arangosh.js";
  if [ -f "$ARANGOSH_SCRIPT" ];
  then
    export ARANGOSH_SCRIPT;
    echo $'\nArangosh script set to '$ARANGOSH_SCRIPT;
  else
    echo $'\nArangosh script not found: '$ARANGOSH_SCRIPT;
    exit;
  fi
else
  echo "No arangosh script command was passed.  Available commands are: delete_dbs";
  exit;
fi

COSCRAD_APP_ENV_FILE="./apps/api/src/app/config/$COSCRAD_ENVIRONMENT.env";

if [ -f "$COSCRAD_APP_ENV_FILE" ];
then
  echo $'\nLoading env var from '$COSCRAD_APP_ENV_FILE;
else
  echo $'\n>> COSCRAD_APP_ENV_FILE:' $SUGGESTED_APP_ENV_FILE $'does not exist.\n'
  echo $'PLEASE CREATE' $SUGGESTED_APP_ENV_FILE $'and populate with environment variables based on "sample.env".\n';
  echo $'Unable to continue, exiting COSCRAD setup script.\n';
  exit;
fi

echo $'\n';

# Get .env variables from app configuration
export $(grep -v '^#' $COSCRAD_APP_ENV_FILE | xargs)
echo "ARANGO_DB_HOST_SCHEME: $ARANGO_DB_HOST_SCHEME";
echo "ARANGO_DB_HOST_DOMAIN: $ARANGO_DB_HOST_DOMAIN";
echo "ARANGO_DB_HOST_PORT: $ARANGO_DB_HOST_PORT";
echo "ARANGO_DB_USER: $ARANGO_DB_USER";
echo "ARANGO_DB_NAME: $ARANGO_DB_NAME";

arangosh \
--server.authentication true \
--server.database _system \
--server.username root \
--server.password $ARANGO_DB_ROOT_PASSWORD \
--console.history false \
--javascript.execute $ARANGOSH_SCRIPT
