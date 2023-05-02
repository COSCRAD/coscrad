import { Inject } from '@nestjs/common';
import { writeFileSync } from 'fs';
import { Command, CommandRunner, Option } from 'nest-commander';
import { IRepositoryProvider } from '../domain/repositories/interfaces/repository-provider.interface';
import { ResourceType } from '../domain/types/ResourceType';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';

@Command({
    name: 'domain-dump',
    description: 'test the COSCRAD CLI!',
})
export class DomainDumpCliCommand extends CommandRunner {
    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN) private readonly repositoryProvider: IRepositoryProvider
    ) {
        super();
    }

    async run(_passedParams: string[], options?: Record<string, any>): Promise<void> {
        const result = await this.repositoryProvider.forResource(ResourceType.term).fetchMany();

        writeFileSync(options.filepath, JSON.stringify(result, null, 4));

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
