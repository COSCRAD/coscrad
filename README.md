# Coscrad

## About us

_COSCRAD_ is a loose collaboration of several organizations, technical teams, and communities working in the space of custom software development for indigenous language revitalization and cultural research.

<!-- TODO List member organizations \ projects -->

## About this Repo

We have adopted the monorepo approach to allow our members to maximize opportunities for code sharing and collaboration, while maintaining autonomy and focus on their own individual projects within this workspace.

### Technical Details

This monorepo workspace is managed using [Nx](https://nx.dev). See the `README` in an individual app or lib to learn more about the tools used on that particular project.

### Requirements

You'll need Node v14.17.6. It is recommended that you install node using [nvm](https://github.com/nvm-sh/nvm)).

You'll also need an instance of [ArangoDB](https://www.arangodb.com/).

We provide an optional shell script for spinning up an ArangoDB instance. This will only work if you have docker installed on your development machine. Alternatively, you could run an ArangoDB instance on a VirtualBox VM, a local physical machine, or in the cloud.

#### Arango Setup Script

To fire up a disposable development instance of `ArangoDB` with docker, first from the config directory in the API project, copy sample.env to test.env and development.env in the same directory. Then run

> > npm run start:db:dev

from the project root.

The script will

-   run a test that validates that our dummy data satisfy all domain invariants and
    exports this data to json
-   spin up the Docker instance
-   bind the default arango port 8529 of the container to `$ARANGO_DB_PORT` on the host
-   add a database named `ARANGO_DB_NAME`
-   add all required collections to the database
-   add the user `ARANGO_DB_USER` with password `ARANGO_DB_USER_PASSWORD`
-   grant the user permissions on the database

You will be asked to confirm the location of a persistent volume to be shared
between the docker container and its host.

You will also be asked if you would like to seed the database. If you respond 'y',
the database will be seeded with dummy data that we use for test. This dummy data
respresents a comprehensive application state, including a collection of dummy
data for every `entity type`. Further, all this data has passed though our
domain invariant validation layer.

To verify, your instance is running, open

```
http://localhost:${ARANGO_DB_PORT}
```

in your browser and access the dashboard using `${ARANGO_DB_ROOT_PASSWORD}`.

Note that you will need to update your corresponding .env file(s) for the
environments in which you would like to connect to the docker instance of Arango
to be consistent with the environment variables used by the script.

### Getting Started

Install Nx globally

> > npm install -g @nrwl/cli

Clone this repo

> > git clone https://github.com/COSCRAD/coscrad.git

cd into the repo's directory

> > cd coscrad

Install the dependencies

> > npm install

#### Configuring the environment

##### API (backend)

We use [dotenv](https://www.npmjs.com/package/dotenv) to manage environment variables. All `.env` files for the `api` are maintained in
/COSCRAD/apps/api/src/app/config/. For your convenience, a sample configuration file, `sample.env` is provided. Use this as a starting point for setting up the following configuration files, which are required:

-   development.env
-   test.env
-   staging.env
-   production.env

Note that these files are named according to the corresponding environments, defined in the `Environment` enum in `./constants/Environment.ts` within the same directory. The Arango instance
specified in `test.env` is the one automated e2e tests will run against on the backend.
Finally, note that invalid.env is only used for testing the config setup, and should
not be modified, nor should `sample.env`.

#### Coscrad Frontend (frontend)

**In Progress**

## Workflow

For convenience we have included a quality check script. This script will run lint, jest tests and build for the front-end (coscrad-frontend) and back-end (api).

> > npm run quality-check:coscrad

Contributors should ensure all of these quality checks pass on their end prior to submitting a PR.

### Lint

To run lint for the full-stack, run

> > npm run lint:coscrad

To run lint for a single project, run

> > nx lint <project-name>

For example, to run lint on just the api (backend), run

> > nx lint api

### Tests

##### Jest tests

To run all Jest tests both the Coscrad backend (api) and front-end (coscrad-frontend) together,
run

> > npm run test:coscrad

This will run the Jest tests on the front-end and back-end, but not Cypress tests
on the front-end.

Note: Make sure nx cli is installed globally to run the following commands. Alternatively,
you can prefix a command with npx

> > npx nx <command>

to use the nx binary from the project's node-modules.

To run the tests for a specific project, run

> > nx test <project-name>.

For example, to run the tests for the project `api`, run

> > nx test api

To run a single test, use the `testFile` flag as follows:

> > nx run <project-name>:test --testFile <name-of-test-file>

e.g.

> > nx run api:test --testFile entities.e2e.spec.ts

To run all tests whose names match a RegEx pattern, run

> > nx run <project-name>:test --testPathPattern <regex-to-match-file-paths>

e.g.

> > nx run api:test --testPathPattern 'src/.\*validate.\*'

#### Cypress- Front-end e2e tests

**In Progress**
We also have a set of front-end `e2e` tests using Cypress. The Cypress tests
are maintained in a separate project, whose name is determined by appending
`-e2e` to the name of the corresponding front-end project. So `coscrad-frontend-e2e`
is the project with the Cypress tests for `coscrad-frontend`.

<!-- TODO Add License info \ choose open source license -->

### Build

To build both the Coscrad front-end and back-end, run

> > npm run build:coscrad:prod

A project's build will appear in `/dist/<project-name>`. E.g., the build for the
backend, whose project is called `api` will appear in `/dist/api`

### Swagger

We use [Swagger](https://swagger.io/) to generate our API documentation. To run
swagger locally, run

> > npm run serve:api

and navigate to `http://localhost:{NODE_PORT}/api/docs`.

### Deployment

#### API

Note that when deploying the backend build, you can either set the environment
variables specified in `sample.env` to their production values by setting these
environment variables on your production server or by including a `production.env`
with the appropraite values at `dist/apps/api/production.env` (alongside `main.js`).

<!-- TODO Replace this with more opinionated, detailed deployment suggestions -->

[pm2](https://www.npmjs.com/package/pm2) is a useful process manager for node
applications. You may want to use [NGinx](https://www.nginx.com/) as a reverse proxy and to manage your
certificates using [certbot](https://certbot.eff.org/).
