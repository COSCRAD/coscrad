import { Database } from 'arangojs';
import { aql, AqlQuery } from 'arangojs/aql';
import { isArangoDatabase } from 'arangojs/database';
import { Environment } from '../../app/config/constants/Environment';
import { QueryOperator } from '../../domain/repositories/interfaces/QueryOperator';
import { ISpecification } from '../../domain/repositories/interfaces/specification.interface';
import { isAggregateId } from '../../domain/types/AggregateId';
import { HasAggregateId } from '../../domain/types/HasAggregateId';
import { InternalError } from '../../lib/errors/InternalError';
import { Maybe } from '../../lib/types/maybe';
import { isNotFound, NotFound } from '../../lib/types/not-found';
import { isArangoCollectionId } from './collection-references/ArangoCollectionId';
import buildArangoDocumentHandle from './utilities/buildArangoDocumentHandle';
import { DatabaseDTO } from './utilities/mapEntityDTOToDatabaseDTO';

type ArangoDTO<T> = T & {
    _key: string;
    _id: string;
};

const aqlQueryOperators = {
    [QueryOperator.equals]: '==',
} as const;

const interpretQueryOperatorForAQL = (operator: QueryOperator): string => {
    const lookupResult = aqlQueryOperators[operator];

    if (!lookupResult) throw new InternalError(`Failed to parse operator: ${operator} for AQL.`);

    return lookupResult;
};

export class ArangoDatabase {
    #db: Database;

    constructor(database: Database) {
        if (!isArangoDatabase(database))
            throw new Error('Cannot create an Arango Database from an invalid database connection');

        this.#db = database;
    }

    fetchById = async <TDatabaseDTO extends DatabaseDTO<HasAggregateId>>(
        id: string,
        collectionName: string
    ): Promise<Maybe<TDatabaseDTO>> => {
        if (!isAggregateId(id)) {
            throw new InternalError(`Arango cannot fetchById with invalid id: ${id}`);
        }

        if (!isArangoCollectionId(collectionName)) {
            throw new InternalError(
                `Arango cannot fetchById from an invalid collection: ${collectionName}`
            );
        }

        const allEntities = await this.fetchMany<TDatabaseDTO>(collectionName);

        if (allEntities.length === 0) return NotFound;

        const searchId = buildArangoDocumentHandle(collectionName, id);

        const doIdsMatch = (searchId) => (dbDTO) => {
            const result = dbDTO._id === searchId;

            return result;
        };

        const searchResult = allEntities.find(doIdsMatch(searchId));

        return searchResult || NotFound;
    };

    /**
     *
     * @param collectionName name of the collection
     * @returns array of `DTOs`, empty array if none found
     */
    fetchMany = async <TEntityDTO>(
        collectionName: string,
        specification?: ISpecification<TEntityDTO>
    ): Promise<TEntityDTO[]> => {
        const { query: filterQuery, bindVars: filterBindVars } = specification
            ? this.#convertSpecificationToAQLFilter(specification, 't')
            : aql``;

        const query = specification
            ? `
      FOR t IN @@collectionName 
        ${filterQuery}
        return t
      `
            : `FOR t IN @@collectionName 
      return t
    `;

        const bindVars = {
            ...filterBindVars,
            '@collectionName': collectionName,
        };

        const aqlQuery: AqlQuery = {
            query,
            bindVars,
        };

        const cursor = await this.#db.query(aqlQuery);

        if (cursor.count === 0) return [];

        return cursor.all();
    };

    getCount = async (collectionName: string): Promise<number> => {
        if (!isArangoCollectionId(collectionName)) {
            throw new InternalError(
                `Arango cannot count for collection with invalid collection name: ${collectionName}`
            );
        }

        const results = await this.fetchMany(collectionName);

        return isNotFound(results) ? 0 : results.length;
    };

    create = async <TEntityDTO>(dto: TEntityDTO, collectionName: string): Promise<void> => {
        /**
         * Although the caller should ensure this, it's nice to double check here
         * as a means of making sure our query isn't subject to injection.
         */
        if (!isArangoCollectionId(collectionName)) {
            throw new Error(`Cannot insert into invalid collection: ${collectionName}`);
        }

        const collectionExists = await this.#doesCollectionExist(collectionName);

        if (!collectionExists) throw new Error(`Collection ${collectionName} not found!`);

        const query = `
    INSERT @dto
        INTO @@collectionName
    `;

        const bindVars = {
            dto,
            '@collectionName': collectionName,
        };

        await this.#db.query({
            query,
            bindVars,
        });
    };

    createMany = async <TEntityDTO>(dtos: TEntityDTO[], collectionName: string): Promise<void> => {
        const collectionExists = await this.#doesCollectionExist(collectionName);

        if (!collectionExists) throw new Error(`Collection ${collectionName} not found!`);

        const query = `
    FOR dto IN @dtos
        INSERT dto
            INTO @@collectionName
    `;

        const bindVars = {
            dtos,
            '@collectionName': collectionName,
        };

        /**
         * Apparently, this is a leaky abstraction from Arango's implementation
         * of RocksDB.  Note that this only currently seems to affect `createMany`,
         * which is only used in test setup. We may need to use this option for
         * other queries if we hit this problem elsewhere. The tell-tale sign is
         * a `write-write conflict` error from Arango.
         *
         * For more information see [here](https://github.com/arangodb/arangodb/issues/9702).
         */
        const MAX_NUMBER_OF_RETRIES = 10;

        await this.#db.query(
            {
                query,
                bindVars,
            },
            {
                retryOnConflict: MAX_NUMBER_OF_RETRIES,
            }
        );
    };

    update = async <TUpdateEntityDTO>(
        id: string,
        updatedDto: TUpdateEntityDTO,
        collectionName: string
    ): Promise<void> => {
        const documentToUpdate = await this.fetchById(id, collectionName);

        if (isNotFound(documentToUpdate))
            throw new Error(
                `Cannot update document: ${id} in collection: ${collectionName}, as no document with that id was found`
            );

        // TODO remove cast
        const key = this.#getKeyOfDocument(
            documentToUpdate as unknown as ArangoDTO<TUpdateEntityDTO>
        );

        if (isNotFound(key))
            throw new Error(`No property '_key' was found on document: ${documentToUpdate}`);

        const query = `
            UPDATE @updatedDto IN @@collectionName OPTIONS { keepNull: false }
        `;

        const bindVars = {
            updatedDto: {
                /**
                 * An update query in arango must include enough information
                 * to uniquely identify the document to update.
                 *
                 * Further note that we are merging the `updatedDTO` with the
                 * existing document in case there is information that is persisted
                 * but not populated on the model (e.g. event history, metadata).
                 */
                _key: key,
                ...updatedDto,
            },
            '@collectionName': collectionName,
        };

        await this.#db
            .query({
                query,
                bindVars,
            })
            .catch((err) => {
                throw new InternalError(
                    `Failed to update dto: ${updatedDto} in ${collectionName}. \n Arango errors: ${err}`
                );
            });
    };

    updateMany = async <TUpdatedDoc extends { _key: string }>(
        docUpdates: TUpdatedDoc[],
        collectionName: string
    ): Promise<void> => {
        const query = `
            FOR docUpdate in @docUpdates
            UPDATE docUpdate IN @@collectionName OPTIONS { keepNull: false }
        `;

        const bindVars = {
            docUpdates,
            '@collectionName': collectionName,
        };

        await this.#db
            .query({
                query,
                bindVars,
            })
            .catch((err) => {
                throw new InternalError(
                    `Failed to update dto: ${JSON.stringify(
                        docUpdates
                    )} in ${collectionName}. \n Arango errors: ${err}`
                );
            });
    };

    // TODO Add Soft Delete

    // TODO we should only expose a hard delete for test setup
    delete = async (id: string, collectionName: string): Promise<void> => {
        const documentToRemove = await this.fetchById(id, collectionName);

        if (isNotFound(documentToRemove))
            throw new InternalError(
                `You cannot remove document ${id} in collection ${collectionName} as it does not exist`
            );

        throw new InternalError('ArangoDatabase.delete Not Implemented');
    };

    // TODO We only want this power within test utilities!
    deleteAll = async (collectionName: string): Promise<void> => {
        if (process.env.NODE_ENV !== Environment.test) {
            throw new InternalError(`You can only delete all in a test environment`);
        }

        if (!isArangoCollectionId(collectionName)) {
            throw new InternalError(`Cannot delete all in invalid collection: ${collectionName}`);
        }

        const query = `
    FOR doc in @@collectionName
    REMOVE doc in @@collectionName
    `;

        const bindVars = {
            '@collectionName': collectionName,
        };

        this.#db.query({ query, bindVars });
    };

    #getKeyOfDocument = <TEntityDTO>(document: ArangoDTO<TEntityDTO>): Maybe<string> =>
        typeof document._key === 'string' ? document._key : NotFound;

    #doesCollectionExist = async (collectionName: string): Promise<boolean> =>
        this.#db
            .collections()
            .then((collections) =>
                collections.some((collection) => collection.name === collectionName)
            );

    #convertSpecificationToAQLFilter<TModel>(
        { criterion: { field, operator, value } }: ISpecification<TModel>,
        docNamePlaceholder: string
    ) {
        return {
            query: `FILTER ${docNamePlaceholder}.${field} ${interpretQueryOperatorForAQL(
                operator
            )} @valueToCompare`,
            bindVars: {
                // This prevents AQL injection attacks
                valueToCompare: value,
            },
        };
    }
}
