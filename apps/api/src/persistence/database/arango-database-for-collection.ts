import { isArangoDatabase } from 'arangojs/database';
import { HasEntityID } from '../../domain/models/types/HasEntityId';
import { ISpecification } from '../../domain/repositories/interfaces/ISpecification';
import { EntityId } from '../../domain/types/ResourceId';
import { Maybe } from '../../lib/types/maybe';
import { ArangoDatabase } from './arango-database';
import { ArangoCollectionID } from './types/ArangoCollectionId';
import { DatabaseDocument } from './utilities/mapEntityDTOToDatabaseDTO';

/**
 * Note that at this level we are working with a `DatabaseDocument` (has _key
 * and _id), not an `EntityDTO`. The mapping is taken care of in the
 * repositories layer.
 */
export class ArangoDatabaseForCollection<TEntity extends HasEntityID> {
    #collectionID: ArangoCollectionID;

    #arangoDatabase: ArangoDatabase;

    constructor(arangoDatabase: ArangoDatabase, collectionName: ArangoCollectionID) {
        this.#collectionID = collectionName;

        this.#arangoDatabase = arangoDatabase;

        if (isArangoDatabase(this.#arangoDatabase))
            throw new Error(
                `Received invalid arango db instance: ${JSON.stringify(arangoDatabase)}`
            );
    }

    // Queries (return information)
    fetchById(id: EntityId): Promise<Maybe<DatabaseDocument<TEntity>>> {
        return this.#arangoDatabase.fetchById<DatabaseDocument<TEntity>>(id, this.#collectionID);
    }

    fetchMany(specification?: ISpecification<TEntity>): Promise<DatabaseDocument<TEntity>[]> {
        return this.#arangoDatabase.fetchMany<DatabaseDocument<TEntity>>(
            this.#collectionID,
            // TODO remove cast, handle mapping layer
            specification as unknown as ISpecification<DatabaseDocument<TEntity>>
        );
    }

    getCount(): Promise<number> {
        return this.#arangoDatabase.getCount(this.#collectionID);
    }

    // Commands (mutate state)
    create(DatabaseDocument: DatabaseDocument<TEntity>) {
        // Handle the difference in _id \ _key between model and database
        return this.#arangoDatabase.create(DatabaseDocument, this.#collectionID);
    }

    createMany(DatabaseDocuments: DatabaseDocument<TEntity>[]) {
        return this.#arangoDatabase.createMany(DatabaseDocuments, this.#collectionID);
    }

    update(id: EntityId, updateDTO: DatabaseDocument<TEntity>) {
        return this.#arangoDatabase.update(id, updateDTO, this.#collectionID);
    }
}
