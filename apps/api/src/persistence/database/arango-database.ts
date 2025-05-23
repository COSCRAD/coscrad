import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Database } from 'arangojs';
import { aql, AqlQuery } from 'arangojs/aql';
import { isArangoDatabase } from 'arangojs/database';
import { isTestEnvironment } from '../../app/config/constants/environment';
import { QueryOperator } from '../../domain/repositories/interfaces/QueryOperator';
import { ISpecification } from '../../domain/repositories/interfaces/specification.interface';
import { isAggregateId } from '../../domain/types/AggregateId';
import { HasAggregateId } from '../../domain/types/HasAggregateId';
import { InternalError } from '../../lib/errors/InternalError';
import { Maybe } from '../../lib/types/maybe';
import { isNotFound, NotFound } from '../../lib/types/not-found';
import { DatabaseCollectionSnapshot } from '../../test-data/utilities';
import { ArangoDatabaseForCollection } from './arango-database-for-collection';
import buildArangoDocumentHandle from './utilities/buildArangoDocumentHandle';
import { ArangoDocumentForAggregateRoot } from './utilities/mapEntityDTOToDatabaseDocument';

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
    private readonly db: Database;

    constructor(database: Database) {
        if (!isArangoDatabase(database))
            throw new Error('Cannot create an Arango Database from an invalid database connection');

        this.db = database;
    }

    getDatabaseName(): string {
        return this.db.name;
    }

    fetchById = async <TDatabaseDTO extends ArangoDocumentForAggregateRoot<HasAggregateId>>(
        id: string,
        collectionName: string
    ): Promise<Maybe<TDatabaseDTO>> => {
        if (!isAggregateId(id)) {
            throw new InternalError(`Arango cannot fetchById with invalid id: ${id}`);
        }

        const aqlQuery = `
        FOR doc in @@collectionName
        FILTER doc._key == @id
        return doc
        `;

        const cursor = await this.db.query({
            query: aqlQuery,
            bindVars: {
                '@collectionName': collectionName,
                id,
            },
        });

        const allDocs = await cursor.all();

        if (allDocs.length === 0) return NotFound;

        const searchId = buildArangoDocumentHandle(collectionName, id);

        const doIdsMatch = (searchId) => (dbDTO) => {
            const result = dbDTO._id === searchId;

            return result;
        };

        const searchResult = allDocs.find(doIdsMatch(searchId));

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
        const _dbName = this.db.name;

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

        const cursor = await this.db.query(aqlQuery);

        if (cursor.count === 0) return [];

        const result = await cursor.all();

        return result;
    };

    export = async (collectionName: string): Promise<Maybe<DatabaseCollectionSnapshot>> => {
        const collection = this.db.collection(collectionName);

        if (!collection.exists()) {
            return NotFound;
        }

        const checksumResult = await collection.checksum({
            withRevisions: false,
            withData: true,
        });

        const { checksum } = checksumResult;

        const documents = await this.fetchMany(collectionName);

        return {
            checksum,
            documents,
        };
    };

    import = async (
        collectionName: string,
        documents: unknown[],
        type: 'edge' | 'document',
        checksumFromPreviousExport?: string
    ) => {
        const collection = this.db.collection(collectionName);

        const doesCollectionExist = await collection.exists();

        // Do we want a flag to enable this behaviour?
        if (!doesCollectionExist) {
            if (type === 'document') {
                await this.db.createCollection(collectionName);
            }

            if (type === 'edge') {
                await this.db.createEdgeCollection(collectionName);
            }

            throw new InternalError(
                `Failed to create missing collection. Invalid Arango collection type: ${type}`
            );
        }

        const { count: currentCollectionSize } = await collection.count();

        if (currentCollectionSize !== 0) {
            throw new InternalError(
                `You can only import to an empty collection. Collection: ${collectionName} has ${currentCollectionSize} documents.`
            );
        }

        await collection.import(documents, {});

        const _updated = await new ArangoDatabaseForCollection(
            new ArangoDatabase(this.db),
            collection.name
        ).fetchMany();

        const { checksum: checksumAfterImport } = await collection.checksum({
            withRevisions: false,
            withData: true,
        });

        if (
            !isNonEmptyString(checksumAfterImport) ||
            checksumAfterImport !== checksumFromPreviousExport
        ) {
            throw new InternalError(
                `Failed to import data to collection: ${collectionName}. Checksums do not match. Export: ${checksumFromPreviousExport}, post-import: ${checksumAfterImport}`,
                []
            );
        }
    };

    // TODO renamme this method to `count`
    getCount = async (collectionName: string): Promise<number> => {
        // TODO Use direct count query instead for efficiency
        const results = await this.fetchMany(collectionName);

        return isNotFound(results) ? 0 : results.length;
    };

    create = async <TEntityDTO>(dto: TEntityDTO, collectionName: string): Promise<void> => {
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

        const cursor = await this.db
            .query({
                query,
                bindVars,
            })
            .catch((error) => {
                throw new InternalError(
                    `failed to create in Arango database: ${JSON.stringify(
                        dto
                    )}. Arango error: \n ${error}"`
                );
            });

        await cursor.all();
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

        const cursor = await this.db.query(
            {
                query,
                bindVars,
            },
            {
                retryOnConflict: MAX_NUMBER_OF_RETRIES,
            }
        );

        await cursor.all();
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

        await this.db
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

        await this.db
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

    // We only allow hard-deletes for non-aggregate root collections (e.g. migrations)
    delete = async (id: string, collectionName: string): Promise<void> => {
        const documentToRemove = await this.fetchById(id, collectionName);

        if (isNotFound(documentToRemove))
            throw new InternalError(
                `You cannot remove document ${id} in collection ${collectionName} as it does not exist`
            );

        // if (
        //     !([ArangoCollectionId.migrations, ArangoCollectionId.uuids] as string[]).includes(
        //         collectionName
        //     )
        // ) {
        //     throw new InternalError(
        //         'ArangoDatabase.delete Not Implemented except for migrations and ID generation'
        //     );
        // }

        const query = `
            REMOVE @id in @@collectionName
            `;

        const bindVars = {
            id,
            '@collectionName': collectionName,
        };

        await this.db
            .query({
                query,
                bindVars,
            })
            .catch((err) => {
                throw new InternalError(
                    `Failed to remove document ${id} from ${collectionName}. \n Arango errors: ${err}`
                );
            });
    };

    // TODO We only want this power within test utilities!
    deleteAll = async (collectionName: string): Promise<void> => {
        // TODO make this or Environment.e2e ?
        if (!isTestEnvironment(process.env.NODE_ENV) && !collectionName.includes('VIEW')) {
            throw new InternalError(
                `You can only delete all in a test environment. Your environment is: ${process.env.NODE_ENV}`
            );
        }

        const query = `
    FOR doc in @@collectionName
    REMOVE doc in @@collectionName
    `;

        const bindVars = {
            '@collectionName': collectionName,
        };

        await this.db.query({ query, bindVars }).catch((error) => {
            throw new Error(`failed to delete all in collection: ${collectionName}. ${error}`);
        });
    };

    /**
     * We provide this escape hatch to get around our abstraction layers if
     * necessary.
     */
    async query(aqlQuery: AqlQuery) {
        return this.db.query(aqlQuery);
    }

    #getKeyOfDocument = <TEntityDTO>(document: ArangoDTO<TEntityDTO>): Maybe<string> =>
        typeof document._key === 'string' ? document._key : NotFound;

    #doesCollectionExist = async (collectionName: string): Promise<boolean> =>
        this.db
            .collections()
            .then((collections) =>
                collections.some((collection) => collection.name === collectionName)
            );

    #convertSpecificationToAQLFilter<TModel>(
        { criterion: { field, operator, value } }: ISpecification<TModel>,
        docNamePlaceholder: string
    ) {
        const buildQuery = (predicateStatement) => ({
            query: `FILTER ${predicateStatement}`,
            bindVars: {
                // This prevents AQL injection attacks
                valueToCompare: value,
            },
        });

        // TODO We need a separate layer for compiling queries
        // TODO We need a unit test of this logic. Currently we are only testing this via e2e tests of command handlers.
        let predicateStatement: string;

        if (operator === QueryOperator.hasOriginalText) {
            predicateStatement = `${docNamePlaceholder}.${field}.items[0].text == @valueToCompare`;

            return buildQuery(predicateStatement);
        }

        if (operator === QueryOperator.isIncludedInArray) {
            /**
             * https://docs.arangodb.com/3.11/aql/functions/array/#contains_array
             * Note that this is an alias for POSITION which has a bit of a
             * strange API. There is a third parameter, which we have omitted,
             * which if set to `true` will cause the function to return the index
             * instead of a boolean. We are using the version that returns
             * `true` if the array contains the value and `false` otherwise.
             */
            predicateStatement = `CONTAINS_ARRAY("${value}",${docNamePlaceholder}.${field})`;

            return buildQuery(predicateStatement);
        }

        predicateStatement = `${docNamePlaceholder}.${field} ${interpretQueryOperatorForAQL(
            operator
        )} @valueToCompare`;

        const result = buildQuery(predicateStatement);

        return result;
    }
}
