import { Inject } from '@nestjs/common';
import { ArangoQueryRunner } from '../persistence/database/arango-query-runner';
import { Migrator } from '../persistence/migrations';
import { CliCommand, CliCommandRunner } from './cli-command.decorator';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from './logging';

@CliCommand({
    description: `runs all available database migrations`,
    name: `run-migrations`,
})
export class RunMigrationsCliCommand extends CliCommandRunner {
    constructor(
        private readonly migrator: Migrator,
        // TODO program to ICoscradQueryRunner and inject at run-time
        private readonly queryRunner: ArangoQueryRunner,
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger
    ) {
        super();

        console.log(`Instantiating Migration 1`);
    }

    async run() {
        this.logger.log(`Running the following migrations: \n`.concat(this.migrator.list()));

        await this.migrator.runAllAvailableMigrations(this.queryRunner);
    }
}
