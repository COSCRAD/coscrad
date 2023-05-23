# TODO Break `coscrad-cli` out into a separate app

# COSCRAD CLI

## About

`coscrad-cli` is a command line tool for data administration.

## Usage

### Building and Running

To build `coscrad-cli`, run

> > > npx run api:build:cli

To run `coscrad-cli`, run

> > > node dist/apps/coscrad-cli/main.js <command-name> <command-options>

For example,

> > > node dist/apps/coscrad-cli/main.js data-dump -f mybackup.data.json

You will need to copy a `production.env` to the directory you run the cli from.
Any data dumps will be to the working directory. Note that we often use the
format <{prefix}.data.json> for convenience, because any `*.data.json` is
git ignored in our project.

### Options:

> > > -h, --help

display help for command

### Commands:

> > > data-dump [-f {filename} | --filename={filename}]

dumps the database state to a snapshot file

> > > data-restore [-f {filename} | --filename={filename}]

restores the database state from a snapshot file

> > > list-migrations

lists available database migrations

> > > run-migrations

runs all available database migrations

> > > revert-latest-migration

reverts the most recently run migration, if there is one

> > > validate-invariants

reports invariant validation for all aggregate root instances
