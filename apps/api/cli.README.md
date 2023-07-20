# TODO Break `coscrad-cli` out into a separate app

# COSCRAD CLI

## About

`coscrad-cli` is a command line tool for data administration.

## Usage

### Building and Running

To build `coscrad-cli`, run

> > > nx run api:build:cli

Note that you should set an environment variable `NODE_ENV` to a non-production
environment (e.g., `development` or `e2e`) before running the build.

To run `coscrad-cli`, run

> > > node dist/apps/coscrad-cli/main.js <command-name> <command-options>

For example,

> > > node dist/apps/coscrad-cli/main.js data-dump -f mybackup.data.json

You will need to copy an `<Environment>.env` to the directory you run the cli from.
Note that `Environment` must line up with the value of `NODE_ENV` when you
ran the build.

Any data dumps will be to the working directory. Note that we often use the
format <{prefix}.data.json> for convenience, because any `*.data.json` is
git ignored in our project.

### Options:

> > > -h, --help

display help for command

### Commands:

> > > data-dump [-f {filename} | --filename={filename}]

dumps the database state to a snapshot file

> > > data-restore [-f {filename} | --filename={filename}] (`$DATA_MODE=import` mode only)

restores the database state from a snapshot file

> > > list-migrations

lists available database migrations

> > > run-migrations

runs all available database migrations

> > > revert-latest-migration

reverts the most recently run migration, if there is one

> > > validate-invariants

reports invariant validation for all aggregate root instances

> > > clear-database

clears the database between tests (`$DATA_MODE=_CYPRESS_` mode only)

> > > seed-test-data-with-command --type={COMMAND_TYPE} (--payload-overrides={SERIALIZED_PAYLOAD_OVERRIDES_OBJECT})

executes a fixture command (by type) with optional overrides to seed test data
