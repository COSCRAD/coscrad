echo "Setting Environment..."
export NODE_ENV="e2e"

FILE="e2e.env"

echo "Building COSCRAD CLI..."
echo "Using Node Environment:"
echo $NODE_ENV
# The CLI is used to seed \ clean database state between tests
npx nx run api:build:cli --skip-nx-cache

echo "Executing test CLI command"
node ../../dist/apps/coscrad-cli/main.js -h

echo "Clearing the test database"
node ../../dist/apps/coscrad-cli/main.js clear-database