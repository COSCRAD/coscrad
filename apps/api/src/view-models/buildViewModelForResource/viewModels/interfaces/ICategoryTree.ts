import { CategorizableCompositeIdentifier } from '../../../../domain/models/categories/types/ResourceOrNoteCompositeIdentifier';
import { ViewModelId } from '../types/ViewModelId';

export interface ICategoryTree {
    id: ViewModelId;

    label: string;

    members: CategorizableCompositeIdentifier[];

    children: ICategoryTree[];
}
