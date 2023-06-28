import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { DataImporter } from '../persistence/repositories/data-importer';
import { CliCommand, CliCommandRunner } from './cli-command.decorator';

@CliCommand({
    name: 'clear-database',
    description: '(Cypress mode only) clears database for automated tests',
})
export class ClearDatabaseCliCommand extends CliCommandRunner {
    dataImporter: DataImporter;

    constructor(databaseProvider: ArangoDatabaseProvider) {
        super();

        this.dataImporter = new DataImporter(databaseProvider);
    }

    async run(_passedParams: string[]) {
        return this.dataImporter.deleteAllData();
    }
}
