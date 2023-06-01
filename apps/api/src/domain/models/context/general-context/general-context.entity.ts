import { Union2Member } from '@coscrad/data-types';
import { EdgeConnectionContext } from '../context.entity';
import { EDGE_CONNECTION_CONTEXT_UNION } from '../edge-connection.entity';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

@Union2Member(EDGE_CONNECTION_CONTEXT_UNION, EdgeConnectionContextType.general)
export class GeneralContext extends EdgeConnectionContext {
    readonly type = EdgeConnectionContextType.general;
}
