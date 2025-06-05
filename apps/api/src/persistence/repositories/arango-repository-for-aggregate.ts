import { NotImplementedException } from '@nestjs/common';
import { InstanceFactory } from '../../domain/factories/get-instance-factory-for-resource';
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
import { ArangoDatabaseProvider } from '../database/database.provider';
import { ArangoDatabaseDocument } from '../database/utilities/mapEntityDTOToDatabaseDocument';

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
    protected arangoDatabaseForEntitysCollection: ArangoDatabaseForCollection<TEntity>;

    // Typically just uses the model constructor
    protected instanceFactory: InstanceFactory<TEntity>;

    protected mapDocumentToEntityDTO: (doc: ArangoDatabaseDocument<TEntity>) => DTO<TEntity>;

    protected mapEntityDTOToDocument: (dto: DTO<TEntity>) => ArangoDatabaseDocument<TEntity>;

    constructor(
        arangoDatabaseProvider: ArangoDatabaseProvider,
        collectionName: ArangoCollectionId,
        instanceFactory: InstanceFactory<TEntity>,
        documentToEntity,
        entityToDocument
    ) {
        this.arangoDatabaseForEntitysCollection =
            arangoDatabaseProvider.getDatabaseForCollection<TEntity>(collectionName);

        this.instanceFactory = instanceFactory;

        this.mapDocumentToEntityDTO = documentToEntity;

        this.mapEntityDTOToDocument = entityToDocument;
    }

    async fetchById(id: AggregateId): Promise<ResultOrError<Maybe<TEntity>>> {
        const searchResultForDTO = await this.arangoDatabaseForEntitysCollection
            .fetchById(id)
            .catch((error) => {
                const innerErrors = error.message ? [new InternalError(error.message)] : [];

                throw new InternalError(
                    `Failed to fetch by id (${id}) ${innerErrors
                        .map((e) => e.toString())
                        .join(' \n ')}`
                );
            });

        return isNotFound(searchResultForDTO)
            ? NotFound
            : this.instanceFactory(this.mapDocumentToEntityDTO(searchResultForDTO));
    }

    async fetchMany(specification?: ISpecification<TEntity>): Promise<ResultOrError<TEntity>[]> {
        return this.arangoDatabaseForEntitysCollection
            .fetchMany(specification)
            .then((dtos) => dtos.map(this.mapDocumentToEntityDTO).map(this.instanceFactory));
    }

    async getCount(): Promise<number> {
        // We assume there are no invalid DTOs here- otherwise they are included in count
        return this.arangoDatabaseForEntitysCollection.getCount();
    }

    /**
     * TODO We do not currently have a unit test for this but rely on higher
     * level integration tests that drive this repository in the domain. As such,
     * we shouldn't implement this until one of the commands that uses the snapshot
     * instead of events relies upon this functionality. For now, we have only
     * implemented this method for the `ArangoCommandRepositoryForAggregateRoot`, i.e.
     * the event-sourced command repository.
     */
    async exist(_ids: AggregateId[]): Promise<AggregateId[]> {
        throw new NotImplementedException();
    }

    async create(entity: TEntity) {
        /**
         * TODO Write the event to the event directory atomically with the query.
         */
        return this.arangoDatabaseForEntitysCollection
            .create(this.mapEntityDTOToDocument(entity.toDTO()))
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
            .map((dto) => this.mapEntityDTOToDocument(dto));

        /**
         * TODO Write the event to the event directory atomically with the query.
         */
        return this.arangoDatabaseForEntitysCollection
            .createMany(createDTOs as ArangoDatabaseDocument<TEntity>[])
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
        const updatedDTO = this.mapEntityDTOToDocument(updatedEntity.toDTO());

        return this.arangoDatabaseForEntitysCollection.update(
            updatedEntity.id,
            updatedDTO as DeepPartial<ArangoDatabaseDocument<TEntity>>
        );
    }
}
