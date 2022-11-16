import { ResourceType } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../utils/types/functional-component';

export interface IResourceDetailPresenterFactory<T> {
    (resourceType: ResourceType): FunctionalComponent<T>;
}
