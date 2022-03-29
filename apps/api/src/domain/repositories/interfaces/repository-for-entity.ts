import { ResultOrError } from 'apps/api/src/types/ResultOrError';
import { Maybe } from '../../../lib/types/maybe';
import { Entity } from '../../models/entity';
import { EntityId } from '../../types/entity-id';
import { ISpecification } from './ISpecification';

/**
 * This interface is similar to `DatabaseForCollection` except that the methods
 * now return `domain model` instances. Note that we may have to add additional
 * methods on concrete repositories for more model-specific behaviour. Also,
 * we need to deal with `graph edge` relationships.
 */
export interface IRepositoryForEntity<TEntity extends Entity> {
    fetchById: (id: EntityId) => Promise<ResultOrError<Maybe<TEntity>>>;

    // Returns an empty array if none found
    fetchMany: (specification?: ISpecification<TEntity>) => Promise<ResultOrError<TEntity>[]>;

    getCount: () => Promise<number>;

    create: (entity: TEntity) => Promise<void>;

    createMany: (entities: TEntity[]) => Promise<void>;

    /**
     * TODO [design] How should we handle updates? It seems like a better pattern
     * would be to express the update via methods on the domain model and overwrite
     * the existing model on each update. However, this is less efficient.
     */
    // update: (id: EntityId, updateEntity: Partial<TEntity>) => Promise<void>;
}
