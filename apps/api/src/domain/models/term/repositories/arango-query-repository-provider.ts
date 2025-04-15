import { ResourceType } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { DiscoveryService } from '@nestjs/core';
import { InternalError } from '../../../../lib/errors/InternalError';
import {
    ArangoViewRepositoryMetadata,
    getArangoViewRepositoryMetadata,
    hasArangoViewRepositoryMetatdata,
} from '../../../../persistence/database/decorators/arango-view-repository.decorator';
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
    //    TODO Use the standard []`Reflector` pattern](https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata) from `NestJS`
    constructor(private readonly discoveryService: DiscoveryService) {}

    // can this be `forView(viewtype: string)` ?
    forView<T extends IPublishable>(resourceType: ResourceType): T {
        const searchResult = this.discoveryService.getProviders().flatMap(({ instance }): T[] => {
            const ctor = isNullOrUndefined(instance) ? null : instance.constructor;

            if (isNullOrUndefined(instance) || !hasArangoViewRepositoryMetatdata(ctor)) {
                return [];
            }

            /**
             * We are asserting that this exists at this point because `hasX` returned true
             */
            const meta = getArangoViewRepositoryMetadata(ctor) as ArangoViewRepositoryMetadata;

            return meta.viewType == resourceType ? [instance] : [];
        });

        if (searchResult.length == 0) {
            throw new InternalError(
                `Cannot provide a query repository for unknown view type: ${resourceType}`
            );
        }

        if (searchResult.length > 1) {
            throw new InternalError(
                `Multiple query repositories have been annotated for view type: ${resourceType}`
            );
        }

        return searchResult[0] as T;
    }
}
