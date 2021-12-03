import { Entity } from '../../domain/models/entity';
import { IRepositoryForEntity } from '../../domain/repositories/interfaces/repository-for-entity';
import { EntityId } from '../../domain/types/entity-id';
import { Maybe } from '../../lib/types/maybe';
import { isNotFound, notFound } from '../../lib/types/not-found';
import { PartialDTO } from '../../types/partial-dto';
import { ArangoDatabaseForCollection } from '../database/arango-database-for-collection';
import { DatabaseProvider } from '../database/database.provider';
import { ArangoCollectionID } from '../database/get-arango-collection-ids';

export type InstanceFactory<TEntity> = (dto: PartialDTO<TEntity>) => TEntity;

/**
 * TODO We need to add error handling. It is especially important that if
 * the `instance factory` fails to build an instance because the dto violates
 * the model invariants that an easy to understand error is returned.
 */
export class RepositoryForEntity<TEntity extends Entity>
  implements IRepositoryForEntity<TEntity>
{
  #arangoDatabaseForEntitysCollection: ArangoDatabaseForCollection<
    PartialDTO<TEntity>
  >;

  // Typically just uses the model constructor
  #instanceFactory: InstanceFactory<TEntity>;

  constructor(
    arangoDatabaseProvider: DatabaseProvider,
    collectionName: ArangoCollectionID,
    instanceFactory: InstanceFactory<TEntity>
  ) {
    this.#arangoDatabaseForEntitysCollection =
      arangoDatabaseProvider.getDatabaseForCollection(collectionName);

    this.#instanceFactory = instanceFactory;
  }

  async fetchById(id: EntityId): Promise<Maybe<TEntity>> {
    const searchResultForDTO =
      await this.#arangoDatabaseForEntitysCollection.fetchById(id);

    return isNotFound(searchResultForDTO)
      ? notFound
      : this.#instanceFactory(searchResultForDTO);
  }

  async fetchMany(): Promise<TEntity[]> {
    return this.#arangoDatabaseForEntitysCollection
      .fetchMany()
      .then((dtos) => dtos.map(this.#instanceFactory));
  }

  async getCount(): Promise<number> {
    return this.#arangoDatabaseForEntitysCollection.getCount();
  }

  async create(entity: TEntity) {
    const createDTO = entity.toDTO();

    return this.#arangoDatabaseForEntitysCollection.create(entity.toDTO());
  }

  async createMany(entities: TEntity[]) {
    const createDTOs = entities.map((entity) => entity.toDTO());

    return this.#arangoDatabaseForEntitysCollection.createMany(createDTOs);
  }

  async update() {}
}
