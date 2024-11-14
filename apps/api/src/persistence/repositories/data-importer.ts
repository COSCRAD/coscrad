import { readFileSync } from 'fs';
import { ICoscradLogger } from '../../coscrad-cli/logging';
import { HasAggregateId } from '../../domain/types/HasAggregateId';
import { InternalError } from '../../lib/errors/InternalError';
import { ArangoCollectionId } from '../database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../database/database.provider';
import { DatabaseDTO } from '../database/utilities/mapEntityDTOToDatabaseDocument';

export const DATA_MODE = 'DATA_MODE';

export class DataImporter {
    constructor(
        private readonly databaseProvider: ArangoDatabaseProvider,
        private readonly logger: ICoscradLogger
    ) {}

    /**
     * Note that this method will import additional data from a dump file, stacking
     * on top of what data is already there, with errors in case there are collisions
     * in keys \ IDs.
     */
    async import({ filepath }: { filepath: string }): Promise<void> {
        /**
         * This functions like the pop-out tab on a VHS or audio cassette in that
         * it enforces us to be intentional about writing data. By leaving this
         * env variable unset in production, we will avoid accidentally importing
         * data there.
         */
        if (process.env[DATA_MODE] !== 'import') {
            throw new InternalError(`You must set $DATA_MODE=import to enable imports.`);
        }

        const parsedSnapshot = JSON.parse(readFileSync(filepath, { encoding: 'utf-8' }));

        const writeDocumentData = ([collectionName, documents]: [
            ArangoCollectionId,
            DatabaseDTO<HasAggregateId>[]
        ]) => this.databaseProvider.getDatabaseForCollection(collectionName).createMany(documents);

        await Promise.all(Object.entries(parsedSnapshot.document).map(writeDocumentData));

        await Promise.all(Object.entries(parsedSnapshot.edge).map(writeDocumentData));
    }

    async deleteAllData(): Promise<void> {
        const dataMode = process.env[DATA_MODE];

        if (dataMode !== '_CYPRESS_') {
            throw new InternalError(
                `You must set $DATA_MODE=_CYPRESS_ to enable deleting data from collections`
            );
        }

        this.logger.log(
            `Attempting to delete data from all collections in the database: ${this.databaseProvider
                .getDBInstance()
                .getDatabaseName()}`
        );

        await Promise.all(
            Object.values(ArangoCollectionId).map((collectionName) =>
                this.databaseProvider.getDBInstance().deleteAll(collectionName)
            )
        );
    }
}
