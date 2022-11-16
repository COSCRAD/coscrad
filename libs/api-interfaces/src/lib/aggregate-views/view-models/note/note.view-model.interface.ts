import { IBaseViewModel } from '../base.view-model.interface';
import { IEdgeConnectionMember } from './edge-connection-member.interface';

export interface INoteViewModel extends IBaseViewModel {
    note: string;
    relatedResources: IEdgeConnectionMember[];
}
