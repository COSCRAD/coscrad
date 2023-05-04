import { readFileSync } from 'fs';
import { Environment } from '../../app/config/constants/Environment';
import { HasAggregateId } from '../../domain/types/HasAggregateId';
import { InternalError } from '../../lib/errors/InternalError';
import { ArangoCollectionId } from '../database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../database/database.provider';
import { DatabaseDTO } from '../database/utilities/mapEntityDTOToDatabaseDTO';

export class DataImporter {
    constructor(private readonly databaseProvider: ArangoDatabaseProvider) {}

    async restore({ filepath }: { filepath: string }): Promise<void> {
        if (process.env.NODE_ENV === Environment.production) {
            throw new InternalError(`You cannot overwrite the production database with this tool.`);
        }

        // TODO move this to a service class so we can reuse it outside of the CLI if needed
        const parsedSnapshot = JSON.parse(readFileSync(filepath, { encoding: 'utf-8' }));

        const writeDocumentData = ([collectionName, documents]: [
            ArangoCollectionId,
            DatabaseDTO<HasAggregateId>[]
        ]) => this.databaseProvider.getDatabaseForCollection(collectionName).createMany(documents);

        await Promise.all(Object.entries(parsedSnapshot.document).map(writeDocumentData));

        await Promise.all(Object.entries(parsedSnapshot.edge).map(writeDocumentData));
    }
}
