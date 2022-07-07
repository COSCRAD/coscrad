import { InstanceFactory } from '../../domain/factories/getInstanceFactoryForResource';
import { Aggregate } from '../../domain/models/aggregate.entity';
import { IRepositoryForAggregate } from '../../domain/repositories/interfaces/repository-for-aggregate.interface';
import { ISpecification } from '../../domain/repositories/interfaces/specification.interface';
import { AggregateId } from '../../domain/types/AggregateId';
import { InternalError } from '../../lib/errors/InternalError';
import { Maybe } from '../../lib/types/maybe';
import { isNotFound, NotFound } from '../../lib/types/not-found';
import { DeepPartial } from '../../types/DeepPartial';
import { DTO } from '../../types/DTO';
import { ResultOrError } from '../../types/ResultOrError';
import { ArangoDatabaseForCollection } from '../database/arango-database-for-collection';
import { ArangoCollectionId } from '../database/collection-references/ArangoCollectionId';
import { DatabaseProvider } from '../database/database.provider';
import { DatabaseDocument } from '../database/utilities/mapEntityDTOToDatabaseDTO';

/**
 * TODO We need to add error handling. It is especially important that if
 * the `instance factory` fails to build an instance because the dto violates
 * the model invariants that an easy to understand error is returned.
 *
 * TODO Use a mixin for cloneable behaviour.
 */
export class ArangoRepositoryForAggregate<TEntity extends Aggregate>
    implements IRepositoryForAggregate<TEntity>
{
    #arangoDatabaseForEntitysCollection: ArangoDatabaseForCollection<TEntity>;

    // Typically just uses the model constructor
    #instanceFactory: InstanceFactory<TEntity>;

    #mapDocumentToEntityDTO: (doc: DatabaseDocument<TEntity>) => DTO<TEntity>;

    #mapEntityDTOToDocument: (dto: DTO<TEntity>) => DatabaseDocument<TEntity>;

    constructor(
        arangoDatabaseProvider: DatabaseProvider,
        collectionName: ArangoCollectionId,
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

    async fetchById(id: AggregateId): Promise<ResultOrError<Maybe<TEntity>>> {
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
        return this.#arangoDatabaseForEntitysCollection
            .create(this.#mapEntityDTOToDocument(entity.toDTO()))
            .catch((err) => {
                throw new InternalError(
                    `Failed to create entity: ${JSON.stringify(
                        entity.toDTO()
                    )}. \n Arango Error: ${err}`
                );
            });
    }

    async createMany(entities: TEntity[]) {
        if (entities.length === 0) return;
        const createDTOs = entities
            .map((entity) => entity.toDTO())
            .map((dto) => this.#mapEntityDTOToDocument(dto));

        return this.#arangoDatabaseForEntitysCollection
            .createMany(createDTOs as DatabaseDocument<TEntity>[])
            .catch((err) => {
                throw new InternalError(
                    `Failed to create many entities: ${JSON.stringify(
                        entities
                    )}. \n Arango error: ${err}`
                );
            });
    }

    /**
     *
     * @param updatedEntity the complete updated intance
     *
     * Note that we always have a complete updated instance because we must check
     * invariant validation rules and state transition rules before updating. We
     * do not expose to the client the ability to merge updates to the database
     * directly.
     */
    async update(updatedEntity: TEntity) {
        const updatedDTO = this.#mapEntityDTOToDocument(updatedEntity.toDTO());

        return this.#arangoDatabaseForEntitysCollection.update(
            updatedEntity.id,
            updatedDTO as DeepPartial<DatabaseDocument<TEntity>>
        );
    }
}
