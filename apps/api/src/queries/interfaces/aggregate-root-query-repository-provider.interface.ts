import { ResourceType } from '../../domain/types/ResourceType';
import { IAggregateRootQueryRepository } from './aggregate-root.query-repository.interface';

interface IBaseResourceView {
    type: string;
    id: string;
    isPublished: boolean;
}

export const QUERY_REPOSITORY_PROVIDER_TOKEN = `QUERY_REPOSITORY_PROVIDER_TOKEN`;

export interface IQueryRepositoryProvider {
    forResource<TResourceView extends IBaseResourceView = IBaseResourceView>(
        resourceType: ResourceType
    ): IAggregateRootQueryRepository<TResourceView>;
}
