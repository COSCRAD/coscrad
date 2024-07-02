import { IEdgeConnectionContext } from '../edge-connection-context.interface';
import { EdgeConnectionContextType } from './edge-connection-context-type';

export interface IPageRangeContext extends IEdgeConnectionContext {
    type: typeof EdgeConnectionContextType.pageRange;
    pageIdentifiers: string[];
}
