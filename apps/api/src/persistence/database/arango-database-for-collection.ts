import { AqlQuery } from 'arangojs/aql';
import { isArangoDatabase } from 'arangojs/database';
import { ISpecification } from '../../domain/repositories/interfaces/specification.interface';
import { AggregateId } from '../../domain/types/AggregateId';
import { HasAggregateId } from '../../domain/types/HasAggregateId';
import { InternalError } from '../../lib/errors/InternalError';
import { Maybe } from '../../lib/types/maybe';
import { DeepPartial } from '../../types/DeepPartial';
import { ArangoDatabase } from './arango-database';
import { ArangoDatabaseDocument } from './utilities/mapEntityDTOToDatabaseDocument';

/**
 * Note that at this level we are working with a `DatabaseDocument` (has _key
 * and _id), not an `EntityDTO`. The mapping is taken care of in the
 * repositories layer.
 */
export class ArangoDatabaseForCollection<TEntity extends HasAggregateId> {
    #collectionID: string;

    #arangoDatabase: ArangoDatabase;

    /**
     * We used to type `collectionName: ArangoCollectionName` and enforce this
     * statically. We found this led to unwanted coupling and unnecessary
     * complexity. All collections should be created dynamically if missing
     * after being registered dynamically via annotations.
     *
     * At the db implementation level, we can simply check if the collection
     * exists.
     */
    constructor(arangoDatabase: ArangoDatabase, collectionName: string) {
        this.#collectionID = collectionName;

        this.#arangoDatabase = arangoDatabase;

        if (isArangoDatabase(this.#arangoDatabase))
            throw new Error(
                `Received invalid arango db instance: ${JSON.stringify(arangoDatabase)}`
            );
    }

    // Queries (return information)
    fetchById(id: AggregateId): Promise<Maybe<ArangoDatabaseDocument<TEntity>>> {
        return this.#arangoDatabase
            .fetchById<ArangoDatabaseDocument<TEntity>>(id, this.#collectionID)
            .catch((error) => {
                const innerErrors = error?.message ? [new InternalError(error.message)] : [];

                throw new InternalError(
                    `[Arango Database for Collection]: failed to fetch by ID (${id}) from collection: ${
                        this.#collectionID
                    } \n ${innerErrors.map((e) => e.toString()).join(' \n ')}`
                );
            });
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
    async create(databaseDocument: ArangoDatabaseDocument<TEntity>) {
        // Handle the difference in _id \ _key between model and database
        return this.#arangoDatabase.create(databaseDocument, this.#collectionID).catch((error) => {
            throw new InternalError(
                `ArangoDatabase for collection: ${
                    this.#collectionID
                } failed to create: ${databaseDocument}. \n Arango Error: ${error}`
            );
        });
    }

    async createMany(databaseDocuments: ArangoDatabaseDocument<TEntity>[]) {
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

    delete(id: string): Promise<void> {
        return this.#arangoDatabase.delete(id, this.#collectionID);
    }

    clear(): Promise<void> {
        return this.#arangoDatabase.deleteAll(this.#collectionID);
    }

    update(id: AggregateId, updateDTO: DeepPartial<ArangoDatabaseDocument<TEntity>>) {
        return this.#arangoDatabase.update(id, updateDTO, this.#collectionID);
    }

    query(aqlQuery: AqlQuery) {
        if (
            this.#collectionID.includes('__VIEWS') &&
            ['insert', 'update', 'remove', 'upsert', 'replace'].some((keyword) =>
                aqlQuery.query.toLowerCase().includes(keyword)
            )
        ) {
            console.log(`ARANGO DB has an update with bind vars: ${aqlQuery.bindVars}}`);
        }

        return this.#arangoDatabase.query(aqlQuery);
    }
}
