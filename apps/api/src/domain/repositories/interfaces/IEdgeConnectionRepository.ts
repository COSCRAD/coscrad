import { Maybe } from '../../../lib/types/maybe';
import { ResultOrError } from '../../../types/ResultOrError';
import { EdgeConnection } from '../../models/context/edge-connection.entity';
import { EntityId } from '../../types/ResourceId';
import { ISpecification } from './ISpecification';

export interface IEdgeConnectionRepository {
    /**
     * Find one edge connection by ID.
     *
     * @returns EdgeConnection or symbol(NotFound)
     */
    fetchById: (id: EntityId) => Promise<ResultOrError<Maybe<EdgeConnection>>>;

    // Returns an empty array if none found
    fetchMany: (
        specification?: ISpecification<EdgeConnection>
    ) => Promise<ResultOrError<EdgeConnection>[]>;

    // Do we want getStats instead?
    getCount: () => Promise<number>;
}
