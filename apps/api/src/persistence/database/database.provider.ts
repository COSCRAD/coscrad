import { Injectable } from '@nestjs/common';
import { HasEntityID } from '../../domain/models/types/HasEntityId';
import { ArangoConnection, ArangoConnectionProvider } from './arango-connection.provider';
import { ArangoDatabase } from './arango-database';
import { ArangoDatabaseForCollection } from './arango-database-for-collection';
import { ArangoCollectionID } from './types/ArangoCollectionId';

/**
 * TODO [https://www.pivotaltracker.com/story/show/181559601]
 *
 * Rename this `ArangoDatabaseProvider`, as this is our
 * Arango specific implementation. Do this after we update our approach
 * to dependency injection.
 */
@Injectable()
export class DatabaseProvider {
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
    getDatabaseForCollection = <TEntity extends HasEntityID>(
        collectionName: ArangoCollectionID
    ): ArangoDatabaseForCollection<TEntity> => {
        if (!this.#arangoInstance)
            // TODO should we inject this?
            this.#arangoInstance = new ArangoDatabase(this.#databaseConnection);

        return new ArangoDatabaseForCollection<TEntity>(this.#arangoInstance, collectionName);
    };
}
