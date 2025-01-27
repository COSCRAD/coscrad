# Coscrad

## About us

_COSCRAD_ is a loose collaboration of several organizations, technical teams, and communities working in the space of custom software development for indigenous language revitalization and cultural research.

<!-- TODO List member organizations \ projects -->

## About this Repo

We have adopted the monorepo approach to allow our members to maximize opportunities for code sharing and collaboration, while maintaining autonomy and focus on their own individual projects within this workspace.

### Projects

#### Apps

Our apps are of two kinds:

**core coscrad applications**

-   [`api`](./apps/api/README.md) (core back-end for the COSCRAD `web of knowledge`)
-   [`coscrad-frontend`](./apps/coscrad-frontend/README.md) (standard front-end for the COSCRAD `web of knowledge`)

**community projects**

-   `tng-dictionary` (maintained by Justin Bambrick, TNG)
-   `tsilqotin-language-hub` (maintained by Justin Bambrick, TNG)
-   `tng-radio-hub` (maintained by Blake Sellars, TNG)

The core apps are developed and maintained by the core COSCRAD team. These projects
are subject to strict guidelines for code quality and automated test coverage.

The community projects currently consist of several prototypes of front-end clients
that leverage the COSCRAD API. The Many ideas explored in the community projects
will eventually find their way into Coscrad's core.

**COSCRAD CLI**
The `coscrad-cli` is a command line tool for data administration tasks. Its use is documented [here](./apps/api/cli.README.md)

In the future, once our domain has been moved to a separate lib, we will move
the `COSCRAD CLI` to a standalone app in the mono-repo.

#### libs

We maintain several libraries, which allow us to share code between applications in the monorepo.
For example, we share validation constraints between the back-end and client to allow
for a single, consistent implementation of validation logic.

We also share UX widgets
between prototype projects and `coscrad-frontend`. This provides a natural approach
to selectively incorporating new tools and features from these prototype projects.

-   [`@coscrad/api-interfaces`](./libs/api-interfaces/README.md)
-   [`@coscrad/data-types` ](./libs/data-types//README.md)
-   [`@coscrad/validation-constraints`](./libs/validation-constraints/README.md)
-   [`@coscrad/commands`](./libs/commands/README.md)
-   [`@coscrad/media-player` ](./libs/media-player/README.md)

## Technical Details

This monorepo workspace is managed using [Nx](https://nx.dev). See the `README` in an individual app or lib to learn more about the tools used on that particular project.

### Requirements

You'll need Node v18.12.0. It is recommended that you install node using [nvm](https://github.com/nvm-sh/nvm)).

You'll also need an instance of [ArangoDB](https://www.arangodb.com/).

We recommend that you use `yarn` as a package manager, as it provides better support
for managing peer dependencies.

We provide an optional shell script for spinning up an ArangoDB instance. This will only work if you have docker installed on your development machine. Alternatively, you could run an ArangoDB instance on a VirtualBox VM, a local physical machine, in the cloud, or via one of Arango's enterprise hosting solutions.

#### OS Level Dependencies

Some functionality related to media management depends upon [fluent-ffmpeg](https://www.npmjs.com/package/fluent-ffmpeg),
which in turn requires [ffmpeg](http://www.ffmpeg.org/) to be installed on your OS.

For Ubuntu 20.04, you can run

> > > sudo apt update

> > > sudo apt install ffmpeg

to install `ffmpeg`.

### Getting Started

Clone this repo

> > git clone https://github.com/COSCRAD/coscrad.git

cd into the repo's directory

> > cd coscrad

Install the dependencies

> > yarn install --frozen-lockfile

#### Setting up config files \ secrets

Copy and customize the following secrets and config files.

> > cp apps/api/src/app/config/sample.env apps/api/src/app/config/development.env

Note that `development.env` is used by `start:db:dev` to configure a local instance of ArangoDB running in a Docker container. The script uses the
env variables related to ArangoDB to spin up an instance with the desired credentials running on the given port.

> > cp apps/coscrad-frontend/src/auth_config.SAMPLE.json apps/coscrad-frontend/src/auth_config.json

> > cp apps/coscrad-frontend/src/configurable-front-matter/data/content.config.SAMPLE.ts apps/coscrad-frontend/src/configurable-front-matter/data/content.config.ts

> > apps/coscrad-frontend-e2e/cypress.env.SAMPLE.json apps/coscrad-frontend-e2e/cypress.env.json

## Workflow

### Dev Mode

Start a local Docker instance of ArangoDB

> > npm run start:db:dev

Note that the offered test data hasn't been well maintained since moving to full event sourcing.

Start the front-end and back-end together:

> > npm run serve:all

To run Jest tests:

> > npx nx test {(api|coscrad-frontend)} [--test-path-pattern={pattern-to-match-in-test-file-path}]

To run Cypress (end-to-end) tests, see the [coscrad-frontend-e2e docs](apps/coscrad-frontend-e2e/README.md)

See the `README` in individual projects and libs for more details about how to run tests and static analsysis.

<!-- TODO Add License info \ choose open source license -->

### Build

To build both the Coscrad front-end and back-end, run

> > npm run build:coscrad:prod

A project's build will appear in `/dist/<project-name>`. E.g., the build for the
backend, whose project is called `api` will appear in `/dist/api`

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

#### Jenkins

We use Jenkins for continuous integration and continuous delivery. We have
integrated Jenkins with our GitHub repo via GitHub apps and GitHub hooks. We
currently use DigitalOcean cloud agents for our builds. We provide a `Jenkinsfile`
that specifies our pipeline as code. While this is reusable in principle, there is
a lot of magic required to configure the tooling in the background. Your best bet
is to contact us if you'd like to automate deployments of your own COSCRAD instance
to your own infra.
