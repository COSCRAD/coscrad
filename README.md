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
We also have built our own command-line interface, `COSCRAD CLI`. This is used
for administrative tasks like dumping data snapshots (in persistence layer, domain layer
and view layer formats), seeding test data and restoring data dumps, dumping
a JSON version of schemas for our domain models, view models, command and event payloads,
and so on.

Currently, `COSCRAD CLI` is part of the `api`, and it is available via a custom
build of the `api`. Run `npx nx build:api:cli` to build the `COSCRAD CLI`. The
cli will be built to `dist/apps/cosccrad-cli`. Run

```
node main.js <command> <options>
```

from within this directory to execute a `COSCRAD CLI` command.

<!-- TODO Add documentation for all commands -->

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

We provide an optional shell script for spinning up an ArangoDB instance. This will only work if you have docker installed on your development machine. Alternatively, you could run an ArangoDB instance on a VirtualBox VM, a local physical machine, in the cloud, or via one of Arango's enterprise hosting solutions.

### Getting Started

Clone this repo

> > git clone https://github.com/COSCRAD/coscrad.git

cd into the repo's directory

> > cd coscrad

Install the dependencies

> > npm ci --legacy-peer-deps

## Workflow

For convenience we have included a quality check script. This script will run lint, Jest tests and build for the front-end (coscrad-frontend) and back-end (api), and run the `e2e` tests via Cypress for the entire COSCRAD core.

> > npm run quality-check:coscrad

Contributors should ensure all of these quality checks pass on their end prior to submitting a PR. Note that eventually this will become the responsibility of our CI system and PRs that break the quality checks will automatically be rejected.

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
