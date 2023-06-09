import { EdgeConnection } from '../../models/context/edge-connection.entity';
import { IRepositoryForAggregate } from './repository-for-aggregate.interface';

export interface IEdgeConnectionRepositoryProvider {
    getEdgeConnectionRepository: () => IRepositoryForAggregate<EdgeConnection>;
}
