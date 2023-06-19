import { IBaseViewModel } from '../base.view-model.interface';
import { IMultilingualText } from '../resources';
import { IEdgeConnectionMember } from './edge-connection-member.interface';
import { EdgeConnectionType } from './edge-connection-type';

export interface INoteViewModel extends IBaseViewModel {
    connectionType: EdgeConnectionType;
    note: IMultilingualText;
    connectedResources: IEdgeConnectionMember[];
}
