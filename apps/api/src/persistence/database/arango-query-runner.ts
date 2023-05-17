import { HasId } from '@coscrad/api-interfaces';
import { Injectable } from '@nestjs/common';
import { isDeepStrictEqual } from 'util';
import { ICoscradQueryRunner } from '../migrations/coscrad-query-runner.interface';
import { ArangoDatabase } from './arango-database';
import { ArangoCollectionId } from './collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from './database.provider';
import { ArangoDatabaseDocument } from './utilities/mapEntityDTOToDatabaseDTO';

@Injectable()
export class ArangoQueryRunner implements ICoscradQueryRunner {
    private readonly arangoDatabase: ArangoDatabase;

    constructor(arangoDatabaseProvider: ArangoDatabaseProvider) {
        this.arangoDatabase = arangoDatabaseProvider.getDBInstance();
    }

    async update<TOldDocument extends ArangoDatabaseDocument<HasId>, UNewDocument>(
        collectionName: ArangoCollectionId,
        calculateUpdate: (oldDocument: TOldDocument) => UNewDocument
    ): Promise<void> {
        console.log(`running update queries with: ${this.arangoDatabase.getDatabaseName()}`);

        const existingDocs = await this.arangoDatabase.fetchMany<TOldDocument>(collectionName);

        const updates = existingDocs
            .map((oldDocument) => ({
                ...calculateUpdate(oldDocument),
                // this ensures that the update can be matched to an existing doc
                _key: oldDocument._key,
            }))
            // avoid unnecessary writes
            .filter((update) => !isDeepStrictEqual(update, {}));

        await this.arangoDatabase.updateMany(updates, collectionName);
    }
}
