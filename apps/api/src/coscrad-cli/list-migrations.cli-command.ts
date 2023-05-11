import { Migrator } from '../persistence/migrations/migrator';
import { CliCommandRunner } from './cli-command.decorator';

export class ListMigrationsCliCommand extends CliCommandRunner {
    constructor(private readonly migrator: Migrator) {
        super();
    }

    async run() {
        throw new Error(`run method not implemented on ListMigrations command!`);
    }
}
