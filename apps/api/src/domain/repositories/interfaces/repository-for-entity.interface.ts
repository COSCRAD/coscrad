import { Maybe } from '../../../lib/types/maybe';
import { ResultOrError } from '../../../types/ResultOrError';
import { AggregateId } from '../../types/AggregateId';
import { HasAggregateId } from '../../types/HasAggregateId';
import { ISpecification } from './specification.interface';

/**
 * This interface is similar to `DatabaseForCollection` except that the methods
 * now return `domain model` instances. Note that we may have to add additional
 * methods on concrete repositories for more model-specific behaviour. Also,
 * we need to deal with `graph edge` relationships.
 */
export interface IRepositoryForEntity<TEntity extends HasAggregateId> {
    fetchById: (id: AggregateId) => Promise<ResultOrError<Maybe<TEntity>>>;

    // Returns an empty array if none found
    fetchMany: (specification?: ISpecification<TEntity>) => Promise<ResultOrError<TEntity>[]>;

    getCount: () => Promise<number>;

    create: (entity: TEntity) => Promise<void>;

    createMany: (entities: TEntity[]) => Promise<void>;
}
