import { ResourceType } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { Maybe } from '../../../../../lib/types/maybe';
import { IAccessible } from '../grant-resource-read-access-to-user/resource-read-access-granted-to-user.event-handler';
import { ResourcePublished } from './resource-published.event';

interface GenericRepository<T = unknown> {
    create(entity: T): Promise<void>;
    fetchById(id: string): Promise<Maybe<T>>;
    fetchMany(): Promise<T[]>;
    count(): Promise<number>;
}

export interface IPublishable {
    publish(id: AggregateId): Promise<void>;
}

export const QUERY_REPOSITORY_PROVIDER_TOKEN = 'QUERY_REPOSITORY_PROVIDER_TOKEN';

export interface IQueryRepositoryProvider {
    forResource<
        T extends IPublishable & IAccessible & GenericRepository = IPublishable &
            IAccessible &
            GenericRepository
    >(
        resourceType: ResourceType
    ): T;
}

@CoscradEventConsumer('RESOURCE_PUBLISHED')
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

        await queryRepository.publish(id);
    }
}
