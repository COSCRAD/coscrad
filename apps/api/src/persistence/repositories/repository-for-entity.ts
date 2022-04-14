import { InstanceFactory } from '../../domain/factories/getInstanceFactoryForEntity';
import { Resource } from '../../domain/models/resource.entity';
import { ISpecification } from '../../domain/repositories/interfaces/ISpecification';
import { IRepositoryForEntity } from '../../domain/repositories/interfaces/repository-for-entity';
import { EntityId } from '../../domain/types/ResourceId';
import { Maybe } from '../../lib/types/maybe';
import { isNotFound, NotFound } from '../../lib/types/not-found';
import { ResultOrError } from '../../types/ResultOrError';
import { ArangoDatabaseForCollection } from '../database/arango-database-for-collection';
import { DatabaseProvider } from '../database/database.provider';
import { ArangoCollectionID } from '../database/types/ArangoCollectionId';
import mapDatabaseDTOToEntityDTO from '../database/utilities/mapDatabaseDTOToEntityDTO';
import mapEntityDTOToDatabaseDTO from '../database/utilities/mapEntityDTOToDatabaseDTO';

/**
 * TODO We need to add error handling. It is especially important that if
 * the `instance factory` fails to build an instance because the dto violates
 * the model invariants that an easy to understand error is returned.
 */
export class RepositoryForEntity<TEntity extends Resource>
    implements IRepositoryForEntity<TEntity>
{
    #arangoDatabaseForEntitysCollection: ArangoDatabaseForCollection<TEntity>;

    // Typically just uses the model constructor
    #instanceFactory: InstanceFactory<TEntity>;

    constructor(
        arangoDatabaseProvider: DatabaseProvider,
        collectionName: ArangoCollectionID,
        instanceFactory: InstanceFactory<TEntity>
    ) {
        this.#arangoDatabaseForEntitysCollection =
            arangoDatabaseProvider.getDatabaseForCollection<TEntity>(collectionName);

        this.#instanceFactory = instanceFactory;
    }

    async fetchById(id: EntityId): Promise<ResultOrError<Maybe<TEntity>>> {
        const searchResultForDTO = await this.#arangoDatabaseForEntitysCollection.fetchById(id);

        return isNotFound(searchResultForDTO)
            ? NotFound
            : this.#instanceFactory(mapDatabaseDTOToEntityDTO(searchResultForDTO));
    }

    async fetchMany(specification?: ISpecification<TEntity>): Promise<ResultOrError<TEntity>[]> {
        return this.#arangoDatabaseForEntitysCollection
            .fetchMany(specification)
            .then((dtos) => dtos.map(mapDatabaseDTOToEntityDTO).map(this.#instanceFactory));
    }

    async getCount(): Promise<number> {
        // We assume there are no invalid DTOs here- otherwise they are included in count
        return this.#arangoDatabaseForEntitysCollection.getCount();
    }

    async create(entity: TEntity) {
        return this.#arangoDatabaseForEntitysCollection.create(
            mapEntityDTOToDatabaseDTO(entity.toDTO())
        );
    }

    async createMany(entities: TEntity[]) {
        const createDTOs = entities.map((entity) => entity.toDTO()).map(mapEntityDTOToDatabaseDTO);

        return this.#arangoDatabaseForEntitysCollection.createMany(createDTOs);
    }

    async update() {
        throw new Error(`Method not implemented: RepositoryForEntity.update`);
    }
}
