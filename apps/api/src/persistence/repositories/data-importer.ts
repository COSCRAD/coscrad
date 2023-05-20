import { readFileSync } from 'fs';
import { HasAggregateId } from '../../domain/types/HasAggregateId';
import { ArangoCollectionId } from '../database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../database/database.provider';
import { DatabaseDTO } from '../database/utilities/mapEntityDTOToDatabaseDTO';

export class DataImporter {
    constructor(private readonly databaseProvider: ArangoDatabaseProvider) {}

    async restore({ filepath }: { filepath: string }): Promise<void> {
        const parsedSnapshot = JSON.parse(readFileSync(filepath, { encoding: 'utf-8' }));

        const writeDocumentData = ([collectionName, documents]: [
            ArangoCollectionId,
            DatabaseDTO<HasAggregateId>[]
        ]) => this.databaseProvider.getDatabaseForCollection(collectionName).createMany(documents);

        await Promise.all(Object.entries(parsedSnapshot.document).map(writeDocumentData));

        await Promise.all(Object.entries(parsedSnapshot.edge).map(writeDocumentData));
    }
}
