import { EdgeConnection } from '../../../domain/models/context/edge-connection.entity';
import buildOneSelfEdgeConnectionForEachResourceType from './buildOneSelfEdgeConnectionForEachResourceType';

export default (uniqueIdOffset: number): EdgeConnection[] => [
    ...buildOneSelfEdgeConnectionForEachResourceType(uniqueIdOffset),
];
