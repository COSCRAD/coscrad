import { Inject } from '@nestjs/common';
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
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger
    ) {
        super();
    }

    async run() {
        const migrations = await this.migrator.list();

        this.logger.log(migrations);
    }
}
