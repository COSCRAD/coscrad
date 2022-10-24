import { ICompositeIdentifier } from '../../../composite-identifier.interface';
import { IEdgeConnectionContext } from './edge-connection-context.interface';
import { EdgeConnectionMemberRole } from './edge-connection-member-role';

export interface IEdgeConnectionMember<
    TContextType extends string = string,
    UResourceType extends string = string
> {
    compositeIdentifier: ICompositeIdentifier<UResourceType, string>;

    context: IEdgeConnectionContext<TContextType>;

    role: EdgeConnectionMemberRole;
}
