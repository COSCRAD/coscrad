set -e

echo "Setting Environment..."
export DATA_MODE="_CYPRESS_"

export NODE_ENV="e2e"

export CYPRESS_REMOTE_DEBUGGING_PORT=9200

bash ./setup-cypress-environment.sh

echo "Opening Cypress..."
npx cypress open

