import { isArangoDatabase } from 'arangojs/database';
import { Entity } from '../../domain/models/entity';
import { ISpecification } from '../../domain/repositories/interfaces/ISpecification';
import { EntityId } from '../../domain/types/EntityId';
import { Maybe } from '../../lib/types/maybe';
import { PartialDTO } from '../../types/partial-dto';
import { ArangoDatabase } from './arango-database';
import { IDatabaseForCollection } from './interfaces/database-for-collection';
import { ArangoCollectionID } from './types/ArangoCollectionId';
import { DatabaseDTO } from './utilities/mapEntityDTOToDatabaseDTO';

/**
 * Note that at this level we are working with a `DatabaseDTO` (has _key
 * and _id), not an `EntityDTO`. The mapping is taken care of in the
 * repositories layer.
 */
export class ArangoDatabaseForCollection<TEntity extends Entity>
    implements IDatabaseForCollection<TEntity>
{
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
    fetchById(id: EntityId): Promise<Maybe<DatabaseDTO<PartialDTO<TEntity>>>> {
        return this.#arangoDatabase.fetchById<DatabaseDTO<TEntity>>(id, this.#collectionID);
    }

    fetchMany(specification?: ISpecification<TEntity>): Promise<DatabaseDTO<TEntity>[]> {
        return this.#arangoDatabase.fetchMany<DatabaseDTO<TEntity>>(
            this.#collectionID,
            // TODO remove cast, handle mapping layer
            specification as unknown as ISpecification<DatabaseDTO<TEntity>>
        );
    }

    getCount(): Promise<number> {
        return this.#arangoDatabase.getCount(this.#collectionID);
    }

    // Commands (mutate state)
    create(databaseDTO: DatabaseDTO<PartialDTO<TEntity>>) {
        // Handle the difference in _id \ _key between model and database
        return this.#arangoDatabase.create(databaseDTO, this.#collectionID);
    }

    createMany(databaseDTOs: DatabaseDTO<PartialDTO<TEntity>>[]) {
        return this.#arangoDatabase.createMany(databaseDTOs, this.#collectionID);
    }

    update(id: EntityId, updateDTO: DatabaseDTO<TEntity>) {
        return this.#arangoDatabase.update(id, updateDTO, this.#collectionID);
    }
}
