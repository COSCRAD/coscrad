import { Inject } from '@nestjs/common';
import { writeFileSync } from 'fs';
import { IRepositoryProvider } from '../domain/repositories/interfaces/repository-provider.interface';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { DomainDataExporter } from '../persistence/repositories/domain-data-exporter';
import convertInMemorySnapshotToDatabaseFormat from '../test-data/utilities/convertInMemorySnapshotToDatabaseFormat';
import { CliCommand, CliCommandOption, CliCommandRunner } from './cli-command.decorator';

@CliCommand({
    name: 'data-dump',
    description: 'dumps the database state to a snapshot file',
})
export class DomainDumpCliCommand extends CliCommandRunner {
    private readonly dataExporter: DomainDataExporter;

    constructor(@Inject(REPOSITORY_PROVIDER_TOKEN) repositoryProvider: IRepositoryProvider) {
        super();

        this.dataExporter = new DomainDataExporter(repositoryProvider);
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

    @CliCommandOption({
        flags: '-f, --filepath [filepath]',
        description: 'the path to write the output to',
        required: true,
    })
    parseFilepath(value: string): string {
        return value;
    }
}
