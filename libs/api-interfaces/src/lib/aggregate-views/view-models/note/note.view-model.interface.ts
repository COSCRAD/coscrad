import { IBaseViewModel } from '../base.view-model.interface';
import { IMultilingualTextRecord } from '../resources';
import { IEdgeConnectionContext } from './edge-connection-context.interface';
import { EdgeConnectionType } from './edge-connection-type';

type ResourceCompositeIdentifier = {
    type: string;
    id: string;
};

type ConnectionMember = {
    resource: ResourceCompositeIdentifier;
    context: IEdgeConnectionContext;
};

export interface IConnectionMembers {
    self?: ConnectionMember;
    to?: ConnectionMember;
    from?: ConnectionMember;
}

export interface INoteViewModel extends IBaseViewModel {
    connectionType: EdgeConnectionType;
    // TODO remove this in favor of `text`
    note: IMultilingualTextRecord;
    connectedResources: IConnectionMembers;
}
