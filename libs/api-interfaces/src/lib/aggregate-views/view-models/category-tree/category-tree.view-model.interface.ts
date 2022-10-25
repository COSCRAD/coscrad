import { ICompositeIdentifier } from '../../../composite-identifier.interface';
import { IBaseViewModel } from '../base.view-model.interface';

export interface ICategoryTreeViewModel<TCategorizableType extends string = string>
    extends IBaseViewModel {
    label: string;

    // The composite identifiers for the resources and notes in this category
    members: ICompositeIdentifier<TCategorizableType>[];

    // Note the self-similarity here
    children: ICategoryTreeViewModel<TCategorizableType>[];
}
