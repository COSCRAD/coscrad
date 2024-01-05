import { isArangoDatabase } from 'arangojs/database';
import { ISpecification } from '../../domain/repositories/interfaces/specification.interface';
import { AggregateId } from '../../domain/types/AggregateId';
import { HasAggregateId } from '../../domain/types/HasAggregateId';
import { InternalError } from '../../lib/errors/InternalError';
import { Maybe } from '../../lib/types/maybe';
import { DeepPartial } from '../../types/DeepPartial';
import { ArangoDatabase } from './arango-database';
import { ArangoCollectionId } from './collection-references/ArangoCollectionId';
import { ArangoDatabaseDocument } from './utilities/mapEntityDTOToDatabaseDTO';

/**
 * Note that at this level we are working with a `DatabaseDocument` (has _key
 * and _id), not an `EntityDTO`. The mapping is taken care of in the
 * repositories layer.
 */
export class ArangoDatabaseForCollection<TEntity extends HasAggregateId> {
    #collectionID: ArangoCollectionId;

    #arangoDatabase: ArangoDatabase;

    constructor(arangoDatabase: ArangoDatabase, collectionName: ArangoCollectionId) {
        this.#collectionID = collectionName;

        this.#arangoDatabase = arangoDatabase;

        if (isArangoDatabase(this.#arangoDatabase))
            throw new Error(
                `Received invalid arango db instance: ${JSON.stringify(arangoDatabase)}`
            );
    }

    // Queries (return information)
    async fetchById(id: AggregateId): Promise<Maybe<ArangoDatabaseDocument<TEntity>>> {
        const _dbName = this.#arangoDatabase.getDatabaseName();

        const _collectionId = this.#collectionID;

        const result = await this.#arangoDatabase
            .fetchById<ArangoDatabaseDocument<TEntity>>(id, this.#collectionID)
            .catch((error) => {
                const innerErrors = error?.message ? [new InternalError(error.message)] : [];

                throw new InternalError(
                    `[Arango Database for Collection]: failed to fetch by ID (${id}) from collection: ${
                        this.#collectionID
                    } \n ${innerErrors.map((e) => e.toString()).join(' \n ')}`
                );
            });

        return result;
    }

    fetchMany(specification?: ISpecification<TEntity>): Promise<ArangoDatabaseDocument<TEntity>[]> {
        return this.#arangoDatabase.fetchMany<ArangoDatabaseDocument<TEntity>>(
            this.#collectionID,
            // TODO remove cast, handle mapping layer
            specification as unknown as ISpecification<ArangoDatabaseDocument<TEntity>>
        );
    }

    getCount(): Promise<number> {
        return this.#arangoDatabase.getCount(this.#collectionID);
    }

    // Commands (mutate state)
    create(databaseDocument: ArangoDatabaseDocument<TEntity>) {
        // Handle the difference in _id \ _key between model and database
        return this.#arangoDatabase.create(databaseDocument, this.#collectionID).catch((_error) => {
            throw new InternalError(
                `Failed to create document in collection: ${this.#collectionID}`
            );
        });
    }

    createMany(databaseDocuments: ArangoDatabaseDocument<TEntity>[]) {
        return this.#arangoDatabase
            .createMany(databaseDocuments, this.#collectionID)
            .catch((error) => {
                throw new InternalError(
                    `Failed to create many in Arango collection: ${
                        this.#collectionID
                    } \n documents: ${JSON.stringify(databaseDocuments)} \n ids: ${databaseDocuments
                        .map(({ _key }) => _key)
                        .join(' , ')} `,
                    error?.message ? [new InternalError(error.message)] : []
                );
            });
    }

    async update(id: AggregateId, updateDTO: DeepPartial<ArangoDatabaseDocument<TEntity>>) {
        await this.#arangoDatabase.update(id, updateDTO, this.#collectionID).catch((error) => {
            const innerErrors = error?.message ? [new InternalError(error.message)] : [];

            throw new InternalError(
                `Failed to update collection: ${
                    this.#collectionID
                } document: ${id} with update: ${updateDTO}`,
                innerErrors
            );
        });
    }
}
