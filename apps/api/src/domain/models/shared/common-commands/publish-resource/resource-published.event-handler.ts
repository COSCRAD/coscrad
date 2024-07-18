import { ResourceType } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { ResourcePublished } from './resource-published.event';

export interface IPublishable {
    publish(id: AggregateId): Promise<void>;
}

interface IQueryRepositoryProvider {
    forResource(resourceType: ResourceType): IPublishable;
}

@CoscradEventConsumer('RESOURCE_PUBLISHED')
export class ResourcePublishedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject('QUERY_REPOSITORY_PROVIDER')
        private readonly queryRepositoryProvider: IQueryRepositoryProvider
    ) {}

    async handle(event: ResourcePublished): Promise<void> {
        // TODO move this responsibility elsewhere it is very dangerous and easy to miss
        if (!event.isOfType('RESOURCE_PUBLISHED')) return;

        const {
            payload: {
                aggregateCompositeIdentifier: { type: resourceType, id },
            },
        } = event;

        await this.queryRepositoryProvider.forResource(resourceType).publish(id);
    }
}
