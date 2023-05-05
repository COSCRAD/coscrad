# @coscrad/api

This project was generated with [Nx](https://nx.dev).

## About

`api` is one of two official COSCRAD apps within this monorepo. It serves as the back-end for the client app `coscrad-frontend`.

Currently, this app includes the application layer, domain write layer, and query (view models) layer for COSCRAD's Web of Knowledge domain.

In the future, we anticipate breaking the domain and query layer into libs, at which point `api` will truly be just that- the infrastructure for interacting with COSCRAD back-end over HTTP.

## Development

### Configuring the environment

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

### Lint

To check lint, run

> > npx nx lint api

### Build

To run the build (and hence TypeScript typecheck), run

> > npx nx build api

### Unit Tests

To run all of the jest tests, run

> > npx nx test api

To run a single test by name, run

> > npx nx test api --test-file=<mytest.spec.tsx>

To run a single test by RegExp, run

> > npx nx test api --test-path-pattern=<PATTERN_TO_MATCH>

In the event that a Jest snapshot fails, first run the single test with a failing snapshot in isolation. To accept the snapshot changes, rerun the test with the -u flag as follows:

> > npx nx test api -- --test-file=<name-of-test-file> -u

### Swagger

We use [Swagger](https://swagger.io/) to generate our API documentation. To run
swagger locally, run

> > npm run serve:api

and navigate to `http://localhost:{NODE_PORT}/api/docs`.

Note that we are still in the process of updating our Swagger annotations, especially for view model schemas.

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

## Domain

Through this project, we introduce the `Web of Knowledge` domain model. Every state change is associated with a single aggregate root and is created via a successful command (e.g. `CREATE_USER`, `ADD_USER_TO_GROUP`).

### Resources

A `Resource` is an aggregate root that participates in the web-of-knowledge. I.e., users can make notes about a particular resource and connect a particular resource to another. In either case, the user can provide some context for the given note or connection.

For example, `book/123` may be connected to `video/5` with some context that identifies a page range for the book and in and out point timestamps for the video.

One of the core COSCRAD values is that our system must be extensible to adding new resource types.

### Categorizables

A `Categorizable` is either a `Resource` or a `note \ connection`. Technically, we represent notes and connections as an `EdgeConnection` in the domain, but the view model is called `Note`. From this perspective, a note may be about a single `Resource` or provide a connection between two `Resources`.

A `Categorizable` can be organized into the `Tree of Knowledge` (category tree). A `Categorizable` can also be tagged.

#### Categories vs. Tags

Categories and tags can provide similar functions, so it's important to ponit out how they differ. A category is hierarchical. You cannot categorize a resource or note without reference to where you are inserting this into the category tree.

Tags are not hierarchical. They provide an alternative that avoids some of the problems with hierarchical classification.

It is important that a research group establish conventions around how tags and categories will be used in a given project.

### System Aggregates

We refer to any aggregate root that is not a categorizable as a "system aggregate". These include

-   users
-   user groups
-   tags
-   the category tree

One can imagine building a distinct web-of-knowledge with different resources (and possibly different models for contextualizing notes and connections) while keeping the same system aggregates and infrastructure.

<!-- TODO Add development guidelines -->
