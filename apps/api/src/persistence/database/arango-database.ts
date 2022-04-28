import { Database } from 'arangojs';
import { AqlQuery } from 'arangojs/aql';
import { isArangoDatabase } from 'arangojs/database';
import { HasEntityID } from '../../domain/models/types/HasEntityId';
import { ISpecification } from '../../domain/repositories/interfaces/ISpecification';
import { QueryOperator } from '../../domain/repositories/interfaces/QueryOperator';
import { InternalError } from '../../lib/errors/InternalError';
import { Maybe } from '../../lib/types/maybe';
import { isNotFound, NotFound } from '../../lib/types/not-found';
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

/**
 * TODO It seems we should sanatize inputs here.
 */
export class ArangoDatabase {
    #db: Database;

    constructor(database: Database) {
        if (!isArangoDatabase(database))
            throw new Error('Cannot create an Arango Database from an invalid database connection');

        this.#db = database;
    }

    fetchById = async <TDatabaseDTO extends DatabaseDTO<HasEntityID>>(
        id: string,
        collectionName: string
    ): Promise<Maybe<TDatabaseDTO>> => {
        const allEntities = await this.fetchMany<TDatabaseDTO>(collectionName);

        if (allEntities.length === 0) return NotFound;

        const searchId = `${collectionName}/${id}`;

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
        const query = specification
            ? `
      FOR t IN ${collectionName} \n\t${this.#convertSpecificationToAQLFilter(specification, 't')}
        return t
      `
            : `FOR t IN ${collectionName} 
      return t
    `;

        const bindVars = {};

        const aqlQuery: AqlQuery = {
            query,
            bindVars,
        };

        const cursor = await this.#db.query(aqlQuery);

        if (cursor.count === 0) return [];

        return cursor.all();
    };

    getCount = async (collectionName: string): Promise<number> => {
        const results = await this.fetchMany(collectionName);

        return isNotFound(results) ? 0 : results.length;
    };

    create = async <TEntityDTO>(dto: TEntityDTO, collectionName: string): Promise<void> => {
        /**
         * Although the caller should ensure this, it's nice to double check here
         * as a means of making sure our query isn't subject to injection.
         */
        const collectionExists = await this.#doesCollectionExist(collectionName);

        if (!collectionExists) throw new Error(`Collection ${collectionName} not found!`);

        const query = `
    INSERT @dto
        INTO ${collectionName}
    `;

        const bindVars = {
            dto,
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
            INTO ${collectionName}
    `;

        const bindVars = {
            dtos,
        };

        await this.#db.query({
            query,
            bindVars,
        });
    };

    update = async <TUpdateEntityDTO>(
        id: string,
        dto: TUpdateEntityDTO,
        collectionName: string
    ): Promise<void> => {
        const documentToUpdate = await this.fetchById(id, collectionName);

        if (isNotFound(documentToUpdate))
            throw new Error(
                [`Cannot update document`, `${id}`, `as no document with that id was found`].join(
                    ' '
                )
            );

        // TODO remove cast
        const key = this.#getKeyOfDocument(
            documentToUpdate as unknown as ArangoDTO<TUpdateEntityDTO>
        );

        if (isNotFound(key))
            throw new Error(`No property '_key' was found on document: ${documentToUpdate}`);

        throw new InternalError('Not Implemented!');
    };

    // TODO Add Replace

    // TODO Add Soft Delete

    // TODO we should only expose a hard delete for test setup
    delete = async (id: string, collectionName: string): Promise<void> => {
        const documentToRemove = await this.fetchById(id, collectionName);

        if (isNotFound(documentToRemove))
            throw new InternalError(
                `You cannot remove document ${id} in collection ${collectionName} as it does not exist`
            );

        const query = `
    REMOVE ${id} in ${collectionName}
    `;

        this.#db.query(query);
    };

    // TODO We only want this power within test utilities!
    deleteAll = async (collectionName: string): Promise<void> => {
        const query = `
    FOR doc in ${collectionName}
    REMOVE doc in ${collectionName}
    `;

        this.#db.query(query);
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
    ): string {
        // a string value must be wrapped in quotes in the query
        const valueToCompare = typeof value === 'string' ? `'${value}'` : value;

        return `FILTER ${docNamePlaceholder}.${field} ${interpretQueryOperatorForAQL(
            operator
        )} ${valueToCompare}`;
    }
}
