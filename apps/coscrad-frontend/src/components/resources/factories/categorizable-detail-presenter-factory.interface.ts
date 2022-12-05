import { CategorizableType } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../utils/types/functional-component';

export interface ICategorizableDetailPresenterFactory<T> {
    (categorizableType: CategorizableType): FunctionalComponent<T>;
}
