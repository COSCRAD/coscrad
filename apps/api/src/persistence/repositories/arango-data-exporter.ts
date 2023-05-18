import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { InMemoryDatabaseSnapshot } from '../../test-data/utilities/convertInMemorySnapshotToDatabaseFormat';
import { ArangoQueryRunner } from '../database/arango-query-runner';
import { ArangoDocumentCollectionId } from '../database/collection-references/ArangoDocumentCollectionId';
import { ArangoEdgeCollectionId } from '../database/collection-references/ArangoEdgeCollectionId';

/**
 * TODO [test-coverage] [https://github.com/COSCRAD/coscrad/pull/381#discussion_r1198018120]
 * We need a test of this class.
 */
export class ArangoDataExporter {
    constructor(private readonly arangoQueryRunner: ArangoQueryRunner) {}

    async fetchSnapshot(): Promise<InMemoryDatabaseSnapshot> {
        const document = {};

        const edge = {};

        /**
         * TODO Consider parallelizing these queries for performance.
         */
        for (const collection of Object.values(ArangoDocumentCollectionId)) {
            const queryResult = await this.arangoQueryRunner.fetchMany(collection);

            document[collection] = queryResult;
        }

        for (const collection of Object.values(ArangoEdgeCollectionId)) {
            const queryResult = await this.arangoQueryRunner.fetchMany(collection);

            edge[collection] = queryResult;
        }

        return {
            document,
            edge,
        } as InMemoryDatabaseSnapshot;
    }

    async dumpSnapshot(directory: string, filename: string) {
        if (!existsSync(directory)) {
            mkdirSync(directory);
        }

        const snapshot = await this.fetchSnapshot();

        try {
            // TODO We need an abstraction for writing files
            writeFileSync(`${directory}/${filename}`, JSON.stringify(snapshot, null, 4));
        } catch (error) {
            throw new Error(`failed to write snapshot`);
        }
    }
}
