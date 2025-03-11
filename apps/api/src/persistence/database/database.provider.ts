import { Injectable } from '@nestjs/common';
import { HasAggregateId } from '../../domain/types/HasAggregateId';
import { ArangoConnection, ArangoConnectionProvider } from './arango-connection.provider';
import { ArangoDatabase } from './arango-database';
import { ArangoDatabaseForCollection } from './arango-database-for-collection';

@Injectable()
export class ArangoDatabaseProvider {
    private readonly databaseConnection: ArangoConnection;

    private arangoInstance: ArangoDatabase;

    constructor(arangoConnectionProvider: ArangoConnectionProvider) {
        this.databaseConnection = arangoConnectionProvider.getConnection();
    }

    async collections() {
        return this.databaseConnection.collections();
    }

    getDBInstance = (): ArangoDatabase => {
        if (!this.arangoInstance)
            // TODO inject this in the constructor
            this.arangoInstance = new ArangoDatabase(this.databaseConnection);

        return this.arangoInstance;
    };

    // TODO [type-safety] Can we correlate entity `DTOs` with `collection IDs`?
    getDatabaseForCollection = <TEntity extends HasAggregateId>(
        collectionName: string
    ): ArangoDatabaseForCollection<TEntity> => {
        if (!this.arangoInstance)
            // TODO should we inject this?
            this.arangoInstance = new ArangoDatabase(this.databaseConnection);

        return new ArangoDatabaseForCollection<TEntity>(this.arangoInstance, collectionName);
    };

    /**
     * This is a test helper. It will throw if you attempt to call it outside
     * of a testing environment.
     */
    clearViews = async (): Promise<void> => {
        const viewCollections = (await this.databaseConnection.collections(true)).flatMap(
            (collection) => (collection.name.includes('__VIEWS') ? [collection.name] : [])
        );

        await Promise.all(
            viewCollections.map((collectionName) =>
                this.getDatabaseForCollection(collectionName).clear()
            )
        );
    };

    close() {
        this.databaseConnection.close();
    }
}
