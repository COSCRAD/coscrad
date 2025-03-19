import { HasId } from '@coscrad/api-interfaces';
import { Injectable } from '@nestjs/common';
import { isDeepStrictEqual } from 'util';
import { InternalError } from '../../lib/errors/InternalError';
import { Maybe } from '../../lib/types/maybe';
import { DatabaseCollectionSnapshot } from '../../test-data/utilities';
import { ICoscradQueryRunner } from '../migrations/coscrad-query-runner.interface';
import { ArangoDatabase } from './arango-database';
import { ArangoCollectionId } from './collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from './database.provider';
import { ArangoDatabaseDocument } from './utilities/mapEntityDTOToDatabaseDocument';

@Injectable()
export class ArangoQueryRunner implements ICoscradQueryRunner {
    private readonly arangoDatabase: ArangoDatabase;

    constructor(private readonly arangoDatabaseProvider: ArangoDatabaseProvider) {
        this.arangoDatabase = arangoDatabaseProvider.getDBInstance();
    }

    async collections() {
        return this.arangoDatabaseProvider.collections();
    }

    async fetchMany<TDocument>(collectionName: string): Promise<TDocument[]> {
        return this.arangoDatabase.fetchMany(collectionName);
    }

    async export(collectionName: string): Promise<Maybe<DatabaseCollectionSnapshot>> {
        return this.arangoDatabase.export(collectionName);
    }

    async import(
        collectionName: string,
        data: unknown[],
        type: 'edge' | 'document',
        checksum?: string
    ): Promise<void> {
        await this.arangoDatabase.import(collectionName, data, type, checksum).catch((e) => {
            const error = new InternalError(`Failed to import collection: ${collectionName}`, [e]);

            throw error;
        });
    }

    async update<TOldDocument extends ArangoDatabaseDocument<HasId>, UNewDocument>(
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

        await this.arangoDatabase.updateMany(updates, collectionName);
    }

    async create<T>(collectionName: ArangoCollectionId, document: T) {
        await this.arangoDatabase.create(document, collectionName);
    }

    async delete(collectionName: ArangoCollectionId, documentId: string) {
        if (collectionName !== ArangoCollectionId.migrations) {
            throw new Error(
                `Hard deletes are not allowed for aggregate roots. Please use a soft delete instead.`
            );
        }

        await this.arangoDatabase.delete(documentId, collectionName);
    }
}
