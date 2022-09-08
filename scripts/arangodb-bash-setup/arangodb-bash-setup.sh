#!/bin/bash

set -e

# IMPORTANT: Consult sample.env in apps/api/src/app/config for 
# environment configuration prior to running this script

# Check if this bash setup script is being run within it's own directory
VALID_EXECUTE_DIRECTORY="coscrad/scripts/arangodb-bash-setup"
CURRENT_PATH="$PWD";
echo $'\nCURRENT_PATH: '$CURRENT_PATH;


# Split path on /
OLDIFS="$IFS";
IFS='/';
read -a strarr <<< $CURRENT_PATH;
IFS="$OLDIFS";
length=${#strarr[@]};
p1=${strarr[$(($length-3))]};
p2=${strarr[$(($length-2))]};
p3=${strarr[$(($length-1))]};
current_directory="${p1}/${p2}/${p3}";
echo $'\nCurrent Directory: '$current_directory;

if  [ $current_directory != $VALID_EXECUTE_DIRECTORY ];
then
  echo $'\n >> Please execute this script within its enclosing directory';
  echo $'\nEXITING SETUP';
  echo $'\n';
  exit;
else
  echo $'\n Current directory is valid for executing COSCRAD setup script';
fi

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

COSCRAD_APP_ENV_FILE="../../apps/api/src/app/config/$COSCRAD_ENVIRONMENT.env";

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
# source $COSCRAD_APP_ENV_FILE; set -a;
export $(grep -v '^#' $COSCRAD_APP_ENV_FILE | xargs)
# env $(cat $COSCRAD_APP_ENV_FILE | sed 's/#.*//g' | xargs)
echo "ARANGO_DB_HOST_SCHEME: $ARANGO_DB_HOST_SCHEME";
echo "ARANGO_DB_HOST_DOMAIN: $ARANGO_DB_HOST_DOMAIN";
echo "ARANGO_DB_HOST_PORT: $ARANGO_DB_HOST_PORT";
echo "ARANGO_DB_USER: $ARANGO_DB_USER";
echo "ARANGO_DB_NAME: $ARANGO_DB_NAME";

echo $'Load test data? (y/n)';

read test_data_answer;

if [ $test_data_answer = "y" ];
then
    export ARANGO_DB_RUN_WITH_TEST_DATA=yes;
    JSON_URL="https://raw.githubusercontent.com/COSCRAD/coscrad/integration/scripts/arangodb-docker-container-setup/docker-container-scripts/test-data/testData.json";
    (cd ./test-data && curl -O $JSON_URL);
    JSON_FILE="./test-data/testData.json";
    if [ -f "$JSON_FILE" ];
      then
        echo $'\n Test data file: '$JSON_FILE' loaded';
      else
        echo $'\n Test data file: '$JSON_FILE' failed to load';
      fi
    echo $'\n>> Run with test data loaded\n';
else
    export ARANGO_DB_RUN_WITH_TEST_DATA=no;
    echo $'\n>> Test data will not be loaded\n';
fi

echo "Check for running instance of arango server"
ARANGO_RUNNING_CMD=`systemctl status arangodb3.service`;

if [ -z "${ARANGO_RUNNING_CMD##*Active: active (running)*}" ];
then
  echo $'\nArangoDB is running';
else
  echo $'\nArangoDB is not running, please make sure the Arango instance is up.';
  echo "";
  echo "EXITING SETUP";
  echo "";
  exit;
fi

ARANGOSH_DB_SETUP_SCRIPT="js/db_setup.js";

arangosh \
--server.authentication true \
--server.database _system \
--server.username root \
--server.password $ARANGO_DB_ROOT_PASSWORD \
--console.history false \
--javascript.execute $ARANGOSH_DB_SETUP_SCRIPT

wait;

ARANGOSH_COLLECTIONS_AND_DATA_SCRIPT="js/collections_data_setup.js";

arangosh \
--server.authentication true \
--server.database $ARANGO_DB_NAME \
--server.username $ARANGO_DB_USER \
--server.password $ARANGO_DB_USER_PASSWORD \
--console.history false \
--javascript.execute $ARANGOSH_COLLECTIONS_AND_DATA_SCRIPT

echo $'\n>> ArangoDB setup complete.  To login to the dashboard, go to:';
echo $'\n'$ARANGO_DB_HOST_SCHEME'://'$ARANGO_DB_HOST_DOMAIN;
echo $'\n\n';

