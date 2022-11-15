import { IBaseViewModel } from '../base.view-model.interface';
import { ResourceType } from '../resources';
import { IEdgeConnectionMember } from './edge-connection-member.interface';

export interface INoteViewModel extends IBaseViewModel {
    note: string;
    relatedResources: IEdgeConnectionMember<string, ResourceType>[];
}
