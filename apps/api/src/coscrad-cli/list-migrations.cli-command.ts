import { Inject } from '@nestjs/common';
import { Migrator } from '../persistence/migrations/migrator';
import { CliCommand, CliCommandRunner } from './cli-command.decorator';
import { COSCRAD_CLI_LOGGER_TOKEN, ICoscradCliLogger } from './logging';

@CliCommand({
    description: `lists available database migrations`,
    name: `list-migrations`,
})
export class ListMigrationsCliCommand extends CliCommandRunner {
    constructor(
        private readonly migrator: Migrator,
        @Inject(COSCRAD_CLI_LOGGER_TOKEN) private readonly logger: ICoscradCliLogger
    ) {
        super();
    }

    async run() {
        const migrations = await this.migrator.list();

        this.logger.log(migrations);
    }
}
