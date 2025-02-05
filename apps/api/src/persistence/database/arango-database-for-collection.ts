/**
 * TODO Do we want our persistence implementation to depend on this lib?
 * The reason for doing this is that the type is simply inherited upstream
 * all the way to the controller, which should be constrained via the contract
 * provided to the client.
 */
import { IViewUpdateNotification } from '@coscrad/api-interfaces';
import { AqlQuery } from 'arangojs/aql';
import { isArangoDatabase } from 'arangojs/database';
import { Subject } from 'rxjs';
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

    private readonly viewWriteHookSubject = new Subject<IViewUpdateNotification>();

    private isDatabaseForView: boolean;

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

        this.isDatabaseForView = collectionName.includes('__VIEW');

        this.#arangoDatabase = arangoDatabase;

        if (isArangoDatabase(this.#arangoDatabase))
            throw new Error(
                `Received invalid arango db instance: ${JSON.stringify(arangoDatabase)}`
            );
    }

    public getViewUpdateNotifications() {
        return this.viewWriteHookSubject.asObservable();
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
        await this.#arangoDatabase.create(databaseDocument, this.#collectionID);

        if (this.isDatabaseForView) {
            this.viewWriteHookSubject.next({
                data: {
                    type: this.#collectionID,
                },
            });
        }
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

    async delete(id: string) {
        const cursor = await this.#arangoDatabase.delete(id, this.#collectionID);

        if (this.isDatabaseForView) {
            this.viewWriteHookSubject.next({
                data: {
                    type: this.#collectionID,
                },
            });
        }

        return cursor;
    }

    clear(): Promise<void> {
        return this.#arangoDatabase.deleteAll(this.#collectionID);
    }

    async update(id: AggregateId, updateDTO: DeepPartial<ArangoDatabaseDocument<TEntity>>) {
        const cursor = await this.#arangoDatabase.update(id, updateDTO, this.#collectionID);

        if (this.isDatabaseForView) {
            this.viewWriteHookSubject.next({
                data: {
                    type: this.#collectionID,
                },
            });
        }

        return cursor;
    }

    async query(aqlQuery: AqlQuery) {
        const cursor = await this.#arangoDatabase.query(aqlQuery);

        const caseInsensitiveQuery = aqlQuery.query.toLowerCase();

        /**
         * note that this avoids injection because all user inputs are part of the
         * `bindVars` not the `query`
         *
         * The current approach is a hack. See the comment below for a better approach.
         *
         * The best approach is to use a proper messaging queue that pulls
         * from the DB out of process of the back-end.
         */
        if (
            this.isDatabaseForView &&
            ['remove', 'update', 'insert'].some((keyword) => caseInsensitiveQuery.includes(keyword))
        ) {
            this.viewWriteHookSubject.next({
                data: {
                    type: this.#collectionID,
                    /**
                     * TODO We should include the ID as well. One way to do this is to
                     * always put the _key of the doc to update on bind vars with a consistent
                     * key and pull from there. Another is to return the _key of the written
                     * document from an AQL write query and use this for the notification.
                     *
                     * Note that if including the ID, we want to use a web sockets
                     * implementation instead of SSEs to publish news of the updates.
                     */
                },
            });
        }

        return cursor;
    }
}
