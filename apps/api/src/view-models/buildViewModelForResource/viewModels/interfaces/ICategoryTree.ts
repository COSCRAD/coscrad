import { ResourceOrNoteCompositeIdentifier } from '../../../../domain/models/categories/types/ResourceOrNoteCompositeIdentifier';
import { ViewModelId } from '../types/ViewModelId';

export interface ICategoryTree {
    id: ViewModelId;

    label: string;

    members: ResourceOrNoteCompositeIdentifier[];

    children: ICategoryTree[];
}
