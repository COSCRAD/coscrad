import { Resource } from '../../models/resource.entity';
import { ResourceType } from '../../types/ResourceType';
import { IRepositoryForEntity } from './repository-for-entity.interface';

export interface IResourceRepositoryProvider {
    forResource: <TEntity extends Resource>(
        resourceType: ResourceType
    ) => IRepositoryForEntity<TEntity>;
}
