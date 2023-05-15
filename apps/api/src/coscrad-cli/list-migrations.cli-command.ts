import { Logger } from '@nestjs/common';
import { Migrator } from '../persistence/migrations/migrator';
import { CliCommand, CliCommandRunner } from './cli-command.decorator';

@CliCommand({
    description: `lists available database migrations`,
    name: `list-migrations`,
})
export class ListMigrationsCliCommand extends CliCommandRunner {
    constructor(private readonly migrator: Migrator, private readonly logger: Logger) {
        super();
    }

    async run() {
        const migrations = await this.migrator.list();

        this.logger.log(migrations);
    }
}
