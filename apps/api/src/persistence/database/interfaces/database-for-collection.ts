import { Resource } from 'apps/api/src/domain/models/resource.entity';
import { ISpecification } from 'apps/api/src/domain/repositories/interfaces/ISpecification';
import { EntityId } from 'apps/api/src/domain/types/ResourceId';
import { Maybe } from 'apps/api/src/lib/types/maybe';
import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { DatabaseDTO } from '../utilities/mapEntityDTOToDatabaseDTO';

/**
 * This should be identical to `IDatabase`, except that the `collection name`
 * is stored on the instance instead of being passed in to the methods.
 */
export interface IDatabaseForCollection<TEntity extends Resource> {
    // TODO we need an abstraction around `db` dependency
    //   constructor: (db: ?,collectionName: string) => IDatabase;

    fetchById: (id: EntityId) => Promise<Maybe<DatabaseDTO<PartialDTO<TEntity>>>>;

    // Returns an empty array if none found
    // TODO abstract the filters
    fetchMany: (
        specification: ISpecification<TEntity>
    ) => Promise<DatabaseDTO<PartialDTO<TEntity>>[]>;

    getCount: (collectionName: string) => Promise<number>;

    create: (dto: DatabaseDTO<PartialDTO<TEntity>>) => Promise<void>;

    createMany: (dto: DatabaseDTO<PartialDTO<TEntity>>[]) => Promise<void>;

    update: (id: EntityId, dto: DatabaseDTO<PartialDTO<TEntity>>) => Promise<void>;
}
