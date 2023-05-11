import { HasId } from '@coscrad/api-interfaces';
import { isDeepStrictEqual } from 'util';
import { ICoscradQueryRunner } from '../migrations/coscrad-query-runner.interface';
import { ArangoDatabase } from './arango-database';
import { ArangoCollectionId } from './collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from './database.provider';
import { DatabaseDocument } from './utilities/mapEntityDTOToDatabaseDTO';

export class ArangoQueryRunner implements ICoscradQueryRunner {
    private readonly arangoDatabase: ArangoDatabase;

    constructor(arangoDatabaseProvider: ArangoDatabaseProvider) {
        this.arangoDatabase = arangoDatabaseProvider.getDBInstance();
    }

    async update<TOldDocument extends DatabaseDocument<HasId>, UNewDocument>(
        collectionName: ArangoCollectionId,
        calculateUpdate: (oldDocument: TOldDocument) => UNewDocument
    ): Promise<void> {
        const existingDocs = await this.arangoDatabase.fetchMany<TOldDocument>(collectionName);

        const updates = existingDocs
            .map((oldDocument) => ({
                ...calculateUpdate(oldDocument),
                // this ensures that the update can be matched to an existing doc
                _key: oldDocument._key,
            }))
            // avoid unnecessary writes
            .filter((update) => !isDeepStrictEqual(update, {}));

        await Promise.all(
            updates.map((update) => this.arangoDatabase.update(update._key, update, collectionName))
        );
    }
}
