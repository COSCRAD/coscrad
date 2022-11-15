import { ResourceType } from '@coscrad/api-interfaces';
import { ResourceDetailContainer } from './resource-detail-conainer';

export interface IResourceDetailFactory<T> {
    (resourceType: ResourceType): ResourceDetailContainer;
}
