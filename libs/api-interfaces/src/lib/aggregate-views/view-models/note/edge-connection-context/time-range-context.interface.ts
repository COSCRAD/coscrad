import { IEdgeConnectionContext } from '../edge-connection-context.interface';
import { EdgeConnectionContextType } from './edge-connection-context-type';

interface ITimeRangeMilliseconds {
    inPointMilliseconds: number;
    outPointMilliseconds: number;
}

export interface ITimeRangeContext extends IEdgeConnectionContext {
    type: typeof EdgeConnectionContextType.timeRange;
    timeRange: ITimeRangeMilliseconds;
}
