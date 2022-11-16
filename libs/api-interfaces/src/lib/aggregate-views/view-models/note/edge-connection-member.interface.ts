import { ICompositeIdentifier } from '../../../composite-identifier.interface';
import { ResourceType } from '../resources';
import { IEdgeConnectionContext } from './edge-connection-context.interface';
import { EdgeConnectionMemberRole } from './edge-connection-member-role';

// TODO Expose actual context types in api-interfaces layer
export interface IEdgeConnectionMember<TContextType extends string = string> {
    compositeIdentifier: ICompositeIdentifier<ResourceType, string>;

    context: IEdgeConnectionContext<TContextType>;

    role: EdgeConnectionMemberRole;
}
