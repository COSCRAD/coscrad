set -e 

echo "Setting Environment..."
export DATA_MODE="_CYPRESS_"

export NODE_ENV="e2e"

bash ./setup-cypress-environment.sh

echo "Running Cypress..."
npx cypress run