import { IBaseViewModel } from './base.view-model.interface';
import { ResourceCompositeIdentifier } from './resources';

export interface ITagViewModel extends IBaseViewModel {
    label: string;

    // TODO expose members here
    members: ResourceCompositeIdentifier[];
}
