import { Resource } from '../../models/resource.entity';
import { ResourceType } from '../../types/resourceTypes';
import { IRepositoryForEntity } from './repository-for-entity';

export interface IRepositoryProvider {
    forResource: <TEntity extends Resource>(
        resourceType: ResourceType
    ) => IRepositoryForEntity<TEntity>;
}
