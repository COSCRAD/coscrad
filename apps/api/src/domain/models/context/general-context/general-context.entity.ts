import { FixedValue, UnionMember } from '@coscrad/data-types';
import { EdgeConnectionContext } from '../context.entity';
import { EDGE_CONNECTION_CONTEXT_UNION } from '../edge-connection-context-union';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

@UnionMember(EDGE_CONNECTION_CONTEXT_UNION, EdgeConnectionContextType.general)
export class GeneralContext extends EdgeConnectionContext {
    @FixedValue(
        // EdgeConnectionType.general,

        {
            description: `must be: ${EdgeConnectionContextType.general}`,
            label: 'context type',
        }
    )
    readonly type = EdgeConnectionContextType.general;
}
