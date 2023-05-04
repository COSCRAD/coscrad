import { readFileSync } from 'fs';
import { Command, CommandRunner, Option } from 'nest-commander';
import { HasAggregateId } from '../domain/types/HasAggregateId';
import { ArangoCollectionId } from '../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { DatabaseDTO } from '../persistence/database/utilities/mapEntityDTOToDatabaseDTO';

@Command({
    name: 'domain-restore',
    description: 'restores the database state from a snapshot of the domain',
})
export class DomainRestoreCliCommand extends CommandRunner {
    constructor(private readonly databaseProvider: ArangoDatabaseProvider) {
        super();
    }

    async run(_passedParams: string[], { filepath }: { filepath: string }): Promise<void> {
        // if (process.env.NODE_ENV === Environment.production) {
        //     throw new InternalError(`You cannot overwrite the production database with this tool.`);
        // }

        // TODO move this to a service class so we can reuse it outside of the CLI if needed
        const parsedSnapshot = JSON.parse(readFileSync(filepath, { encoding: 'utf-8' }));

        const writeDocumentData = ([collectionName, documents]: [
            ArangoCollectionId,
            DatabaseDTO<HasAggregateId>[]
        ]) => this.databaseProvider.getDatabaseForCollection(collectionName).createMany(documents);

        await Promise.all(Object.entries(parsedSnapshot.document).map(writeDocumentData));

        await Promise.all(Object.entries(parsedSnapshot.edge).map(writeDocumentData));
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
