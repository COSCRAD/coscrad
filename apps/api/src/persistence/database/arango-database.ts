import { Maybe } from 'apps/api/src/lib/types/maybe';
import { isNotFound, NotFound } from 'apps/api/src/lib/types/not-found';
import { Database } from 'arangojs';
import { AqlQuery } from 'arangojs/aql';
import { isArangoDatabase } from 'arangojs/database';
import { Entity } from '../../domain/models/entity';
import { InternalError } from '../../lib/errors/InternalError';
import { PartialDTO } from '../../types/partial-dto';
import { IDatabase } from './interfaces/database';

type ArangoDTO<T> = T & {
  _key: string;
  _id: string;
};

/**
 * TODO It seems we should sanatize inputs here.
 */
export class ArangoDatabase implements IDatabase {
  #db: Database;

  constructor(database: Database) {
    if (!isArangoDatabase(database))
      throw new Error(
        'Cannot create an Arango Database from an invalid database connection'
      );

    this.#db = database;
  }

  fetchById = async <TCreateEntityDto extends PartialDTO<Entity>>(
    id: string,
    collectionName: string
  ): Promise<Maybe<TCreateEntityDto>> => {
    const allEntities = await this.fetchMany<TCreateEntityDto>(collectionName);

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
  fetchMany = async <TCreateEntityDTO>(
    collectionName: string
  ): Promise<TCreateEntityDTO[]> => {
    const query = `
      FOR t IN ${collectionName}
        return t
      `;

    const bindVars = {};

    const aqlQuery: AqlQuery = {
      query,
      bindVars,
    };

    const cursor = await this.#db.query(aqlQuery);

    if (cursor.count === 0) return [];

    // TODO remove cast
    return cursor.all();
  };

  getCount = async (collectionName: string): Promise<number> => {
    const results = await this.fetchMany(collectionName);

    return isNotFound(results) ? 0 : results.length;
  };

  // TODO Error handling.
  create = async <TCreateEntityDto>(
    dto: TCreateEntityDto,
    collectionName: string
  ): Promise<void> => {
    /**
     * Although the caller should ensure this, it's nice to double check here
     * as a means of making sure our query isn't subject to injection.
     */
    const collectionExists = await this.#doesCollectionExist(collectionName);

    if (!collectionExists)
      throw new Error(`Collection ${collectionName} not found!`);
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

  createMany = async <TCreateEntityDto>(
    dtos: TCreateEntityDto[],
    collectionName: string
  ): Promise<void> => {
    // remove this check. It's the callers responsibility to verify the `Collection` exists
    const collectionExists = await this.#doesCollectionExist(collectionName);

    if (!collectionExists)
      throw new Error(`Collection ${collectionName} not found!`);

    const query = `
    FOR dto IN @dtos
        INSERT dto
            INTO ${collectionName}
    `;

    const bindVars = {
      dtos,
    };

    try {
      await this.#db.query({
        query,
        bindVars,
      });
    } catch (error) {
      throw error;
    }
  };

  update = async <TUpdateEntityDTO>(
    id: string,
    dto: TUpdateEntityDTO,
    collectionName: string
  ): Promise<void> => {
    const documentToUpdate = await this.fetchById(id, collectionName);

    if (isNotFound(documentToUpdate))
      throw new Error(
        [
          `Cannot update document`,
          `${id}`,
          `as no document with that id was found`,
        ].join(' ')
      );

    // TODO remove cast
    const key = this.#getKeyOfDocument(
      documentToUpdate as ArangoDTO<TUpdateEntityDTO>
    );

    if (isNotFound(key))
      throw new Error(
        `No property '_key' was found on document: ${documentToUpdate}`
      );

    const query = `
    UPDATE ${key}
        WITH @dto
            IN ${collectionName}
    `;
  };

  // TODO Add Replace

  // TODO Add Soft Delete

  // TODO we should only expose a hard delete for test setup
  delete = async <TUpdateEntityDTO>(
    id: string,
    collectionName: string
  ): Promise<void> => {
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

  #getKeyOfDocument = <TCreateEntityDto>(
    document: ArangoDTO<TCreateEntityDto>
  ): Maybe<string> =>
    typeof document._key === 'string' ? document._key : NotFound;

  #doesCollectionExist = async (collectionName: string): Promise<boolean> =>
    this.#db
      .collections()
      .then((collections) =>
        collections.some((collection) => collection.name === collectionName)
      );
}
