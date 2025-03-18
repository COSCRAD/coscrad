import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { InternalError } from '../../lib/errors/InternalError';
import { isNotFound } from '../../lib/types/not-found';
import { InMemoryDatabaseSnapshot } from '../../test-data/utilities/convertInMemorySnapshotToDatabaseFormat';
import { ArangoQueryRunner } from '../database/arango-query-runner';

/**
 * TODO [test-coverage] [https://github.com/COSCRAD/coscrad/pull/381#discussion_r1198018120]
 * We need a test of this class.
 */
export class ArangoDataExporter {
    constructor(private readonly arangoQueryRunner: ArangoQueryRunner) {}

    async fetchSnapshot(knownEdgeCollections: string[] = []): Promise<InMemoryDatabaseSnapshot> {
        const document = {};

        const edge = {};

        const allCollections = await this.arangoQueryRunner.collections();

        const documentCollectionNames = allCollections
            .map(({ name }) => name)
            .filter((c) => !knownEdgeCollections.includes(c));

        /**
         * TODO Consider parallelizing these queries for performance.
         */
        for (const collection of documentCollectionNames) {
            const queryResult = await this.arangoQueryRunner.export(collection);

            if (isNotFound(queryResult)) {
                throw new InternalError(
                    `Failed to export. Collection: ${collection} does not exist`
                );
            }

            document[collection] = queryResult;
        }

        for (const collection of knownEdgeCollections) {
            // TODO handle the case that the collection does not exist explicitly
            const queryResult = await this.arangoQueryRunner.export(collection);

            if (isNotFound(queryResult)) {
                throw new InternalError(
                    `Failed to export. Collection: ${collection} does not exist`
                );
            }

            edge[collection] = queryResult;
        }

        return {
            document,
            edge,
        } as InMemoryDatabaseSnapshot;
    }

    async dumpSnapshot(directory: string, filename: string, knownEdgeCollections: string[] = []) {
        if (!existsSync(directory)) {
            mkdirSync(directory);
        }

        const snapshot = await this.fetchSnapshot(knownEdgeCollections);

        try {
            // TODO We need an abstraction for writing files
            writeFileSync(`${directory}/${filename}`, JSON.stringify(snapshot, null, 4));
        } catch (error) {
            throw new Error(`failed to write snapshot`);
        }
    }

    async restoreFromSnapshot(snapshot: InMemoryDatabaseSnapshot) {
        /**
         * This functions like the pop-out tab on a VHS or audio cassette in that
         * it enforces us to be intentional about writing data. By leaving this
         * env variable unset in production, we will avoid accidentally importing
         * data there.
         */
        if (process.env['DATA_MODE'] !== 'import') {
            throw new InternalError(`You must set $DATA_MODE=import to enable imports.`);
        }

        const { document: allDocumentSnapshots, edge: allEdgeSnapshots } = snapshot;

        for (const [collectionName, { checksum, documents }] of [
            ...Object.entries(allDocumentSnapshots),
        ]) {
            await this.arangoQueryRunner.import(collectionName, documents, 'document', checksum);
        }

        for (const [collectionName, { checksum, documents }] of [
            ...Object.entries(allEdgeSnapshots),
        ]) {
            await this.arangoQueryRunner.import(collectionName, documents, 'edge', checksum);
        }
    }
}
