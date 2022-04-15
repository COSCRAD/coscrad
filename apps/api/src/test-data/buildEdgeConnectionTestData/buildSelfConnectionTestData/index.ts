import { EdgeConnection } from 'apps/api/src/domain/models/context/edge-connection.entity';
import buildOneSelfEdgeConnectionForEachResourceType from './buildOneSelfEdgeConnectionForEachResourceType';

export default (): EdgeConnection[] => [...buildOneSelfEdgeConnectionForEachResourceType()];
