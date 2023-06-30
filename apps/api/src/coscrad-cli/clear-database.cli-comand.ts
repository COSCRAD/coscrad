import { Inject } from '@nestjs/common';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { DataImporter } from '../persistence/repositories/data-importer';
import { CliCommand, CliCommandRunner } from './cli-command.decorator';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from './logging';

@CliCommand({
    name: 'clear-database',
    description: '(Cypress mode only) clears database for automated tests',
})
export class ClearDatabaseCliCommand extends CliCommandRunner {
    dataImporter: DataImporter;

    constructor(
        databaseProvider: ArangoDatabaseProvider,
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger
    ) {
        super();

        this.dataImporter = new DataImporter(databaseProvider, this.logger);
    }

    // note that this will not work unless in a testing environment with `$DATA_MODE=_CYPRESS`
    async run(_passedParams: string[]) {
        await this.dataImporter.deleteAllData();

        this.logger.log(`Successfully emptied all collections`);
    }
}
