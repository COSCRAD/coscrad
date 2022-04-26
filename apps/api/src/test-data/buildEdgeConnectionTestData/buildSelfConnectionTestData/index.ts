import { EdgeConnection } from 'apps/api/src/domain/models/context/edge-connection.entity';
import { DTO } from 'apps/api/src/types/partial-dto';
import buildOneSelfEdgeConnectionForEachResourceType from './buildOneSelfEdgeConnectionForEachResourceType';

export default (): Omit<DTO<EdgeConnection>, 'id'>[] => [
    ...buildOneSelfEdgeConnectionForEachResourceType(),
];
