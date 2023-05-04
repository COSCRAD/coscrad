import { Inject } from '@nestjs/common';
import { writeFileSync } from 'fs';
import { Command, CommandRunner, Option } from 'nest-commander';
import { IRepositoryProvider } from '../domain/repositories/interfaces/repository-provider.interface';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { DataExporter } from '../persistence/repositories/data-exporter';
import convertInMemorySnapshotToDatabaseFormat from '../test-data/utilities/convertInMemorySnapshotToDatabaseFormat';

@Command({
    name: 'domain-dump',
    description: 'dumps the database state to a snapshot of the domain',
})
export class DomainDumpCliCommand extends CommandRunner {
    private readonly dataExporter: DataExporter;

    constructor(@Inject(REPOSITORY_PROVIDER_TOKEN) repositoryProvider: IRepositoryProvider) {
        super();

        this.dataExporter = new DataExporter(repositoryProvider);
    }

    async run(_passedParams: string[], options?: { filepath: string }): Promise<void> {
        const NUMBER_OF_SPACES_TO_INDENT = 4;

        const domainSnapshot = await this.dataExporter.fetchSnapshot();

        const snapshotInDatabaseFormat = convertInMemorySnapshotToDatabaseFormat(
            domainSnapshot.fetchFullSnapshotInLegacyFormat()
        );

        writeFileSync(
            options.filepath,
            JSON.stringify(snapshotInDatabaseFormat, null, NUMBER_OF_SPACES_TO_INDENT)
        );
    }

    @Option({
        flags: '-f, --filepath [filepath]',
        description: 'the path to write the output to',
        required: true,
    })
    parseFilepath(value: string): string {
        return value;
    }
}
