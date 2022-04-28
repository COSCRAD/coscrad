import { InstanceFactory } from '../../domain/factories/getInstanceFactoryForEntity';
import BaseDomainModel from '../../domain/models/BaseDomainModel';
import { HasEntityID } from '../../domain/models/types/HasEntityId';
import { ISpecification } from '../../domain/repositories/interfaces/ISpecification';
import { IRepositoryForEntity } from '../../domain/repositories/interfaces/repository-for-entity';
import { EntityId } from '../../domain/types/ResourceId';
import { Maybe } from '../../lib/types/maybe';
import { isNotFound, NotFound } from '../../lib/types/not-found';
import { DTO } from '../../types/DTO';
import { ResultOrError } from '../../types/ResultOrError';
import { ArangoDatabaseForCollection } from '../database/arango-database-for-collection';
import { DatabaseProvider } from '../database/database.provider';
import { ArangoCollectionID } from '../database/types/ArangoCollectionId';
import { DatabaseDocument } from '../database/utilities/mapEntityDTOToDatabaseDTO';

/**
 * TODO We need to add error handling. It is especially important that if
 * the `instance factory` fails to build an instance because the dto violates
 * the model invariants that an easy to understand error is returned.
 *
 * TODO Use a mixin for cloneable behaviour.
 */
export class RepositoryForEntity<TEntity extends HasEntityID & BaseDomainModel>
    implements IRepositoryForEntity<TEntity>
{
    #arangoDatabaseForEntitysCollection: ArangoDatabaseForCollection<TEntity>;

    // Typically just uses the model constructor
    #instanceFactory: InstanceFactory<TEntity>;

    #mapDocumentToEntityDTO: (doc: DatabaseDocument<TEntity>) => DTO<TEntity>;

    #mapEntityDTOToDocument: (dto: DTO<TEntity>) => DatabaseDocument<TEntity>;

    constructor(
        arangoDatabaseProvider: DatabaseProvider,
        collectionName: ArangoCollectionID,
        instanceFactory: InstanceFactory<TEntity>,
        documentToEntity,
        entityToDocument
    ) {
        this.#arangoDatabaseForEntitysCollection =
            arangoDatabaseProvider.getDatabaseForCollection<TEntity>(collectionName);

        this.#instanceFactory = instanceFactory;

        this.#mapDocumentToEntityDTO = documentToEntity;

        this.#mapEntityDTOToDocument = entityToDocument;
    }

    async fetchById(id: EntityId): Promise<ResultOrError<Maybe<TEntity>>> {
        const searchResultForDTO = await this.#arangoDatabaseForEntitysCollection.fetchById(id);

        return isNotFound(searchResultForDTO)
            ? NotFound
            : this.#instanceFactory(this.#mapDocumentToEntityDTO(searchResultForDTO));
    }

    async fetchMany(specification?: ISpecification<TEntity>): Promise<ResultOrError<TEntity>[]> {
        return this.#arangoDatabaseForEntitysCollection
            .fetchMany(specification)
            .then((dtos) => dtos.map(this.#mapDocumentToEntityDTO).map(this.#instanceFactory));
    }

    async getCount(): Promise<number> {
        // We assume there are no invalid DTOs here- otherwise they are included in count
        return this.#arangoDatabaseForEntitysCollection.getCount();
    }

    async create(entity: TEntity) {
        return this.#arangoDatabaseForEntitysCollection.create(
            this.#mapEntityDTOToDocument(entity.toDTO())
        );
    }

    async createMany(entities: TEntity[]) {
        const createDTOs = entities
            .map((entity) => entity.toDTO())
            .map((dto) => this.#mapEntityDTOToDocument(dto));

        return this.#arangoDatabaseForEntitysCollection.createMany(
            createDTOs as DatabaseDocument<TEntity>[]
        );
    }

    async update() {
        throw new Error(`Method not implemented: RepositoryForEntity.update`);
    }
}
