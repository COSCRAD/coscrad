import { DiscriminatedBy } from '@coscrad/data-types';
import { EdgeConnectionContext } from '../context.entity';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

/**
 * The `IdentityContext` is used to contextualize the connection from a
 * bibliographic reference to its digital representation. This is the bridge
 * that leads from the 'card catalogue' to the rich digital representation of a
 * resource, where there exist Edge Connections with more rich context.
 */
@DiscriminatedBy(EdgeConnectionContextType.identity)
export class IdentityContext extends EdgeConnectionContext {
    readonly type = EdgeConnectionContextType.identity;
}
