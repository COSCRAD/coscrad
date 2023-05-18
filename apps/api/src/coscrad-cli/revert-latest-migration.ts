import { Inject } from '@nestjs/common';
import { ArangoQueryRunner } from '../persistence/database/arango-query-runner';
import { Migrator } from '../persistence/migrations';
import { ArangoDataExporter } from '../persistence/repositories/arango-data-exporter';
import { CliCommand, CliCommandRunner } from './cli-command.decorator';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from './logging';

@CliCommand({
    description: `reverts the most recently run migration, if there is one`,
    name: `revert-latest-migration`,
})
export class RevertLatestMigrationCliCommand extends CliCommandRunner {
    constructor(
        private readonly migrator: Migrator,
        // TODO program to ICoscradQueryRunner and inject at run-time
        private readonly queryRunner: ArangoQueryRunner,
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger
    ) {
        super();
    }

    async run(): Promise<void> {
        this.logger.log(`Searching for most recent migration...`);

        await this.migrator.revertLatestMigration(
            this.queryRunner,
            new ArangoDataExporter(this.queryRunner),
            this.logger
        );
    }
}
