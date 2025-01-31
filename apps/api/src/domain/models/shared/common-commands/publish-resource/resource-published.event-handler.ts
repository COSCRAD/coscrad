import { ResourceType } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResourcePublished } from './resource-published.event';

export interface IPublishable {
    publish(id: AggregateId): Promise<void>;
}

export interface IQueryRepositoryProvider {
    forResource(resourceType: ResourceType): IPublishable;
}

@CoscradEventConsumer('RESOURCE_PUBLISHED')
export class ResourcePublishedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject('QUERY_REPOSITORY_PROVIDER')
        private readonly queryRepositoryProvider: IQueryRepositoryProvider
    ) {}

    async handle(event: ResourcePublished): Promise<void> {
        const {
            payload: {
                aggregateCompositeIdentifier: { type: resourceType, id },
            },
        } = event;

        console.log({
            publishingAttempt: {
                resourceType,
                id,
            },
        });

        const queryRepository = this.queryRepositoryProvider.forResource(resourceType);

        if (typeof queryRepository.publish !== 'function') {
            throw new InternalError(
                `Failed to obtain a query repository with a publish method from query repository provider: ${JSON.stringify(
                    this.queryRepositoryProvider
                )} \n Received the query repository: ${JSON.stringify(queryRepository)} [${
                    Object.getPrototypeOf(queryRepository).constructor.name
                }]`
            );
        }

        console.log(`PUbLISHING VL: ${id}`);

        await queryRepository.publish(id);
    }
}
