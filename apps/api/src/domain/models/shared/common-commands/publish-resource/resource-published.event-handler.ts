import { Inject } from '@nestjs/common';
import { EventHandler, ICoscradEventHandler } from '../../../../../domain/common';
import {
    IQueryRepositoryProvider,
    QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../../../../queries/interfaces/aggregate-root-query-repository-provider.interface';
import { ResourcePublished } from './resource-published.event';

@EventHandler(`RESOURCE_PUBLISHED`)
export class ResourcePublishedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly queryRepositoryProvider: IQueryRepositoryProvider
    ) {}

    async handle(event: ResourcePublished): Promise<void> {
        const {
            payload: {
                aggregateCompositeIdentifier: { type: resourceType, id },
            },
        } = event;

        await this.queryRepositoryProvider.forResource(resourceType).update({
            id,
            isPublished: true,
        });

        console.log('foo');
    }
}
