import { IBaseViewModel } from './base.view-model.interface';
import { CategorizableCompositeIdentifier } from './categorizable-composite-identifier';

export interface ITagViewModel extends IBaseViewModel {
    id: string;

    label: string;

    members: CategorizableCompositeIdentifier[];
}
