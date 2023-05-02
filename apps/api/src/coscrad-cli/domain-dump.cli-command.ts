import { Inject } from '@nestjs/common';
import { writeFileSync } from 'fs';
import { Command, CommandRunner, Option } from 'nest-commander';
import { IRepositoryProvider } from '../domain/repositories/interfaces/repository-provider.interface';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { DataExporter } from '../persistence/repositories/data-exporter';

@Command({
    name: 'domain-dump',
    description: 'test the COSCRAD CLI!',
})
export class DomainDumpCliCommand extends CommandRunner {
    private readonly dataExporter: DataExporter;

    constructor(@Inject(REPOSITORY_PROVIDER_TOKEN) repositoryProvider: IRepositoryProvider) {
        super();

        this.dataExporter = new DataExporter(repositoryProvider);
    }

    async run(_passedParams: string[], options?: Record<string, any>): Promise<void> {
        const NUMBER_OF_SPACES_TO_INDENT = 4;

        const result = await this.dataExporter.fetchSnapshot();

        writeFileSync(
            options.filepath,
            JSON.stringify(
                result.fetchFullSnapshotInLegacyFormat(),
                null,
                NUMBER_OF_SPACES_TO_INDENT
            )
        );

        Promise.resolve();
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
