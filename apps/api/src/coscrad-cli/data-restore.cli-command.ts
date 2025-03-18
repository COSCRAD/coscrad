import { Inject } from '@nestjs/common';
import { readFileSync } from 'fs';
import { ArangoQueryRunner } from '../persistence/database/arango-query-runner';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { ArangoDataExporter } from '../persistence/repositories/arango-data-exporter';
import { InMemoryDatabaseSnapshot } from '../test-data/utilities';
import { CliCommand, CliCommandOption, CliCommandRunner } from './cli-command.decorator';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from './logging';

@CliCommand({
    name: 'data-restore',
    description: 'restores the database state from a snapshot file',
})
export class DomainRestoreCliCommand extends CliCommandRunner {
    private readonly dataExporter: ArangoDataExporter;

    constructor(
        databaseProvider: ArangoDatabaseProvider,
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger
    ) {
        super();

        this.dataExporter = new ArangoDataExporter(new ArangoQueryRunner(databaseProvider));
    }

    async run(_passedParams: string[], { filepath }: { filepath: string }): Promise<void> {
        const parsedSnapshot = JSON.parse(
            readFileSync(filepath, { encoding: 'utf-8' })
        ) as InMemoryDatabaseSnapshot;

        return this.dataExporter.restoreFromSnapshot(parsedSnapshot);
    }

    @CliCommandOption({
        flags: '-f, --filepath [filepath]',
        description: 'the path to write the output to',
        required: true,
    })
    parseFilepath(value: string): string {
        return value;
    }
}
