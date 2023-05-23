import { Inject } from '@nestjs/common';
import { ArangoQueryRunner } from '../persistence/database/arango-query-runner';
import { Migrator } from '../persistence/migrations';
import { CliCommand, CliCommandRunner } from './cli-command.decorator';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from './logging';

@CliCommand({
    description: `lists available database migrations`,
    name: `list-migrations`,
})
export class ListMigrationsCliCommand extends CliCommandRunner {
    constructor(
        private readonly migrator: Migrator,
        // TODO program to ICoscradQueryRunner and inject at run-time
        private readonly queryRunner: ArangoQueryRunner,
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger
    ) {
        super();
    }

    async run() {
        const migrations = await this.migrator.list(this.queryRunner, {
            // TODO tie this to a command option
            includeAlreadyRun: false,
        });

        if (migrations.length === 0) {
            this.logger.log(`no migrations available`);

            return;
        }

        this.logger.log(migrations);
    }
}
