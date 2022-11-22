import { IBaseViewModel } from '../base.view-model.interface';
import { IEdgeConnectionMember } from './edge-connection-member.interface';
import { EdgeConnectionType } from './edge-connection-type';

export interface INoteViewModel extends IBaseViewModel {
    connectionType: EdgeConnectionType;
    note: string;
    connectedResources: IEdgeConnectionMember[];
}
