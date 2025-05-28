import { ResourceType } from '@coscrad/api-interfaces';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { InternalError } from '../../../../lib/errors/InternalError';
import {
    IPublishable,
    IQueryRepositoryProvider,
} from '../../shared/common-commands/publish-resource/resource-published.event-handler';

/**
 * TODO We need to find a pattern to make this more extensible. Maybe we should
 * have a decorator that declares the query repository.
 * @CoscradQueryRepository(ResourceType.term).
 * Then we can use reflection to return the desired repository.
 */
export class ArangoQueryRepositoryProvider implements IQueryRepositoryProvider {
    private repoMap = new Map<string, IPublishable>();

    forResource<T extends IPublishable>(resourceType: ResourceType): T {
        const searchResult = this.repoMap.get(resourceType);

        if (!isNonEmptyObject(searchResult)) {
            throw new InternalError(
                `Failed to provide a query repository for unsupported resource type: ${resourceType}`
            );
        }

        return searchResult as T;
    }

    register(type: string, repository: IPublishable) {
        if (!this.repoMap.has(type)) {
            this.repoMap.set(type, repository);
        }
    }
}
