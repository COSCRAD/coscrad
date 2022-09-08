#!/bin/bash

set -e

# IMPORTANT: Consult sample.env in apps/api/src/app/config for 
# environment configuration prior to running this script

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

ARANGO_DB_SERVER="arangodbserver";

# Derive project root path and confirm with user
SCRIPTS_PATH="$PWD";
SUGGESTED_SCRIPTS_ROOT_PATH=$SCRIPTS_PATH;

echo $'\nPlease confirm if this is the correct scripts root path for loading test data into Arango?: '$SUGGESTED_SCRIPTS_ROOT_PATH' (y/n)';

while [ -z "$SCRIPTS_ROOT_PATH" ];
do
  read scripts_path_answer;
  if [ $scripts_path_answer = "y" ];
  then
      SCRIPTS_ROOT_PATH=$SUGGESTED_SCRIPTS_ROOT_PATH;
  elif [ $scripts_path_answer = "n" ];
  then
      while [ -z "$SCRIPTS_ROOT_PATH" ]; do
          read -p $'Please enter the correct absolute path for the scripts root path\n' new_scripts_path_answer
          if [ -d "$new_scripts_path_answer" ];
          then
              SCRIPTS_ROOT_PATH=${new_scripts_path_answer%/};
          else
              echo $'Please enter a valid path\n'
          fi
      done
  else
    echo "Bad Input: Please enter y or n";
  fi
done

echo $'\n>> SCRIPTS_ROOT_PATH set to:' $SCRIPTS_ROOT_PATH $'\n';

SUGGESTED_APP_ENV_FILE="$SCRIPTS_ROOT_PATH/$COSCRAD_ENVIRONMENT.env";

echo $'\nPlease confirm the correct .env file: '$SUGGESTED_APP_ENV_FILE' (y/n)';

read project_env_file_answer;

if [ $project_env_file_answer = "y" ];
then
    if [ -f "$SUGGESTED_APP_ENV_FILE" ];
    then
      COSCRAD_APP_ENV_FILE=$SUGGESTED_APP_ENV_FILE;
    else
      echo $'\n>> COSCRAD_APP_ENV_FILE:' $SUGGESTED_APP_ENV_FILE $'does not exist.\n'
      echo $'PLEASE CREATE' $SUGGESTED_APP_ENV_FILE $'and populate with environment variables based on "sample.env".\n';
      echo $'Unable to continue, exiting COSCRAD setup script.\n';
      exit;
    fi
elif [ $project_env_file_answer = "n" ];
then
    while [ -z "$COSCRAD_APP_ENV_FILE" ]; do
        read -p $'Please enter the correct absolute path for the project .env file for COSCRAD\n' new_project_env_file_answer
        if [ -f "$new_project_env_file_answer" ];
        then
            COSCRAD_APP_ENV_FILE=${new_project_env_file_answer};
        else
            echo $'Please enter a valid .env file location\n'
        fi
    done
fi

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
  echo "ArangoDB is running";
else
  echo "ArangoDB is not running, please make sure the Arango instance is up."
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
