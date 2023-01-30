import { Injectable } from '@nestjs/common';
import { HasAggregateId } from '../../domain/types/HasAggregateId';
import { ArangoConnection, ArangoConnectionProvider } from './arango-connection.provider';
import { ArangoDatabase } from './arango-database';
import { ArangoDatabaseForCollection } from './arango-database-for-collection';
import { ArangoCollectionId } from './collection-references/ArangoCollectionId';

@Injectable()
export class ArangoDatabaseProvider {
    readonly #databaseConnection: ArangoConnection;

    #arangoInstance: ArangoDatabase;

    constructor(arangoConnectionProvider: ArangoConnectionProvider) {
        this.#databaseConnection = arangoConnectionProvider.getConnection();
    }

    getDBInstance = (): ArangoDatabase => {
        if (!this.#arangoInstance)
            // TODO inject this in the constructor
            this.#arangoInstance = new ArangoDatabase(this.#databaseConnection);

        return this.#arangoInstance;
    };

    // TODO [type-safety] Can we correlate entity `DTOs` with `collection IDs`?
    getDatabaseForCollection = <TEntity extends HasAggregateId>(
        collectionName: ArangoCollectionId
    ): ArangoDatabaseForCollection<TEntity> => {
        if (!this.#arangoInstance)
            // TODO should we inject this?
            this.#arangoInstance = new ArangoDatabase(this.#databaseConnection);

        return new ArangoDatabaseForCollection<TEntity>(this.#arangoInstance, collectionName);
    };
}
