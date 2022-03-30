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

ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_DIR_NAME="coscrad-arangodb-docker-shared-volume";
ARANGODB_DOCKER_SHARED_SCRIPTS_DIR_NAME="docker-container-scripts";
ARANGO_DB_SERVER="arangodbserver";

# Derive project root path and confirm with user
SCRIPTS_PATH="$PWD";
SUGGESTED_COSCRAD_PROJECT_ROOT_PATH=$SCRIPTS_PATH;

echo $'\nPlease confirm if this is the correct project root path for COSCRAD?: '$SUGGESTED_COSCRAD_PROJECT_ROOT_PATH' (y/n)';

while [ -z "$COSCRAD_PROJECT_ROOT_PATH" ];
do
  read project_path_answer;
  if [ $project_path_answer = "y" ];
  then
      COSCRAD_PROJECT_ROOT_PATH=$SUGGESTED_COSCRAD_PROJECT_ROOT_PATH;
  elif [ $project_path_answer = "n" ];
  then
      while [ -z "$COSCRAD_PROJECT_ROOT_PATH" ]; do
          read -p $'Please enter the correct absolute path for the project root path for COSCRAD\n' new_project_path_answer
          if [ -d "$new_project_path_answer" ];
          then
              COSCRAD_PROJECT_ROOT_PATH=${new_project_path_answer%/};
          else
              echo $'Please enter a valid path\n'
          fi
      done
  else
    echo "Bad Input: Please enter y or n";
  fi
done

echo $'\n>> COSCRAD_PROJECT_ROOT_PATH set to:' $COSCRAD_PROJECT_ROOT_PATH $'\n';

SUGGESTED_APP_ENV_FILE="$COSCRAD_PROJECT_ROOT_PATH/apps/api/src/app/config/$COSCRAD_ENVIRONMENT.env";

echo $'\nPlease confirm the correct .env file: '$SUGGESTED_APP_ENV_FILE' (y/n)';

read project_env_file_answer;

if [ $project_env_file_answer = "y" ];
then
    if [ -f "$SUGGESTED_APP_ENV_FILE" ];
    then
      COSCRAD_APP_ENV_FILE=$SUGGESTED_APP_ENV_FILE;
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

echo $'\n>> COSCRAD_APP_ENV_FILE set to:' $COSCRAD_APP_ENV_FILE $'\n';

# Get .env variables from app configuration
source $COSCRAD_APP_ENV_FILE; set +a;
# env $(cat $COSCRAD_APP_ENV_FILE | sed 's/#.*//g' | xargs)
echo "ARANGO_DB_HOST_SCHEME: $ARANGO_DB_HOST_SCHEME";
echo "ARANGO_DB_HOST_DOMAIN: $ARANGO_DB_HOST_DOMAIN";
echo "ARANGO_DB_HOST_PORT: $ARANGO_DB_HOST_PORT";
echo "ARANGO_DB_USER: $ARANGO_DB_USER";
echo "ARANGO_DB_NAME: $ARANGO_DB_NAME";

SUGGESTED_ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_PATH="${COSCRAD_PROJECT_ROOT_PATH%/*}/$ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_DIR_NAME";

echo $'Configure a location for the location on the server host of the shared volume path between the host and the ArangoDB Docker Container\n'

echo $'Accept the suggested location: '$SUGGESTED_ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_PATH' (y/n)';

read shared_path_answer;

if [ $shared_path_answer = "y" ];
then
    ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_PATH=$SUGGESTED_ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_PATH;
elif [ $shared_path_answer = "n" ];
then
    while [ -z "$ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_PATH" ]; do
        read -p $'\nPlease enter the desired absolute path for the shared volume path between the host and the ArangoDB Docker Container\n' new_shared_path_answer
        if [ -d "$new_shared_path_answer" ];
        then
            ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_PATH=${new_shared_path_answer%/};
        else
            echo $'Please enter a valid path\n'
        fi
    done
fi

echo $'\n>> ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_PATH set to:' $ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_PATH $'\n';

echo $'Load test data? (y/n)';

read test_data_answer;

if [ $test_data_answer = "y" ];
then
    ARANGO_DB_RUN_WITH_TEST_DATA=yes;
    echo $'\n>> Run with test data loaded\n';
else
    ARANGO_DB_RUN_WITH_TEST_DATA=no;
    echo $'\n>> Test data will not be loaded\n';
fi

ARANGODB_ORIGIN_STARTUP_SCRIPTS_PATH="$COSCRAD_PROJECT_ROOT_PATH/scripts/arangodb-docker-container-setup/$ARANGODB_DOCKER_SHARED_SCRIPTS_DIR_NAME";
# ARANGODB_LOCAL_STARTUP_SCRIPTS_PATH="$ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_PATH/$ARANGODB_DOCKER_SHARED_SCRIPTS_DIR_NAME";
# ARANGODB_DESTINATION_STARTUP_SCRIPTS_PATH="$ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_PATH/$ARANGODB_DOCKER_SHARED_SCRIPTS_DIR_NAME";

ARANGODB_DESTINATION_CONTAINER_DOCKER_SHARED_VOLUME_PATH="/home/$ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_DIR_NAME";
ARANGODB_DESTINATION_CONTAINER_DOCKER_SHARED_VOLUME_SCRIPTS_PATH="$ARANGODB_DESTINATION_CONTAINER_DOCKER_SHARED_VOLUME_PATH/$ARANGODB_DOCKER_SHARED_SCRIPTS_DIR_NAME";

# Inside the ArangoDB Docker Container
ARANGODB_CONNECTION_TEST_SCRIPT_COMMAND="$ARANGODB_DESTINATION_CONTAINER_DOCKER_SHARED_VOLUME_SCRIPTS_PATH/arangodb-arangosh-connector.sh test_arangodb_connection";
ARANGODB_DB_AND_COLLECTIONS_SETUP_SCRIPT_COMMAND="$ARANGODB_DESTINATION_CONTAINER_DOCKER_SHARED_VOLUME_SCRIPTS_PATH/arangodb-arangosh-connector.sh load_collections";
ARANGODB_DATA_LOAD_SCRIPT_COMMAND="$ARANGODB_DESTINATION_CONTAINER_DOCKER_SHARED_VOLUME_SCRIPTS_PATH/arangodb-arangosh-connector.sh load_data";

# Create arango volume share location
if [ ! -d "$ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_PATH" ]; then
  mkdir $ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_PATH
  echo "Created local ArangoDB Docker Container shared volume directory $ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_PATH"
else
  echo "Local ArangoDB Docker Container shared volume directory $ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_PATH already present"
fi

echo "Reloading ArangoDB Docker Container setup scripts directory in local ArangoDB Docker Container shared volume directory";

if [ -d "$ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_PATH" ]; then
  echo "Deleting old arango scripts directory $ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_SCRIPTS_PATH in $ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_PATH"
  sudo -u root rm -rf "$ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_SCRIPTS_PATH"
fi

# Copy ArangoDB setup scripts to local share location
cp -R $ARANGODB_ORIGIN_STARTUP_SCRIPTS_PATH $ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_PATH
echo "Copied new ArangoDB Docker Container setup scripts directory to local Docker shared volume directory $ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_PATH"

ARANGO_LOCAL_VOLUME_PATH_CMD=" -v $ARANGODB_LOCAL_DOCKER_SHARED_VOLUME_PATH:$ARANGODB_DESTINATION_CONTAINER_DOCKER_SHARED_VOLUME_PATH";

echo "Check for existing instance of arango server"
DOCKER_PS=`sudo -u root docker ps`;

if [ -z "${DOCKER_PS##*$ARANGO_DB_SERVER*}" ];
then
  echo "Existing docker arango container $ARANGO_DB_SERVER";
  if [ -z "${DOCKER_PS##*$ARANGO_DB_SERVER*}" ];
  then
    echo "stop & remove old instance of docker arango $ARANGO_DB_SERVER container";
    (sudo -u root docker container stop $ARANGO_DB_SERVER || :) && \
      sudo -u root docker container rm $ARANGO_DB_SERVER
  else
    echo "Unknown arango container already running on port $ARANGO_DB_HOST_PORT";
    echo "";
    echo "EXITING SETUP";
    echo "";
    exit;
  fi
fi

wait

echo "Starting new fresh instance of [$ARANGO_DB_SERVER]"

sudo -u root docker run \
--name $ARANGO_DB_SERVER \
-p $ARANGO_DB_HOST_PORT:8529 \
-e ARANGO_DB_HOST_PORT=$ARANGO_DB_HOST_PORT \
-e ARANGO_ROOT_PASSWORD=$ARANGO_DB_ROOT_PASSWORD \
-e ARANGO_DB_USER=$ARANGO_DB_USER \
-e ARANGO_DB_USER_PASSWORD=$ARANGO_DB_USER_PASSWORD \
-e ARANGO_DB_NAME=$ARANGO_DB_NAME \
-e ARANGO_DB_RUN_WITH_TEST_DATA=$ARANGO_DB_RUN_WITH_TEST_DATA \
-e ARANGODB_DESTINATION_CONTAINER_DOCKER_SHARED_VOLUME_SCRIPTS_PATH=$ARANGODB_DESTINATION_CONTAINER_DOCKER_SHARED_VOLUME_SCRIPTS_PATH \
-e COSCRAD_ENVIRONMENT=$COSCRAD_ENVIRONMENT \
-d$ARANGO_LOCAL_VOLUME_PATH_CMD \
arangodb

# wait for pg to start
echo "Waiting for Arango DB to start"
wait

READY=0
until [ "$READY" = 1 ]
do
   DB_CONNECTION=$(sudo -u root docker exec -it $ARANGO_DB_SERVER $ARANGODB_CONNECTION_TEST_SCRIPT_COMMAND);
   echo $DB_CONNECTION;
   if [ -z "${DB_CONNECTION##*,connected*}" ];
   then
     echo $'DB Connected: Configuring ' $ARANGO_DB_NAME $'\n';
     sudo -u root docker exec -it $ARANGO_DB_SERVER $ARANGODB_DB_AND_COLLECTIONS_SETUP_SCRIPT_COMMAND
     READY=1;
   else
     echo "Trying to connect, please wait...";
     sleep 1
   fi
done

ARANGO_DOCKER_PORT=$(sudo docker container inspect --format='{{(index (index .NetworkSettings.Ports "8529/tcp") 0).HostPort}}' $ARANGO_DB_SERVER);

echo $'\n\nVisit the new ArangoDB Instance at: ' $ARANGO_DB_HOST_SCHEME$'://'$ARANGO_DB_HOST_DOMAIN$':'$ARANGO_DOCKER_PORT $'\n\n';
