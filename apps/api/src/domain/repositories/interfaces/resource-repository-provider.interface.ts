import { Resource } from '../../models/resource.entity';
import { ResourceType } from '../../types/ResourceType';
import { IRepositoryForAggregate } from './repository-for-aggregate';

export interface IResourceRepositoryProvider {
    forResource: <TEntity extends Resource>(
        resourceType: ResourceType
    ) => IRepositoryForAggregate<TEntity>;
}
