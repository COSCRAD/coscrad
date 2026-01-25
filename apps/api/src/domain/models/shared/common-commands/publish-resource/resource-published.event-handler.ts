import { Inject } from '@nestjs/common';
import { IResourceQueryRepository } from '../../../../../app/domain-modules/web-of-knowledge/interfaces/resource-query-repository.interface';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { ResourcePublished } from './resource-published.event';

export interface ICountable {
    count(): Promise<number>;
}

export interface IPublishable {
    publish(id: AggregateId): Promise<void>;
}

export const QUERY_REPOSITORY_PROVIDER_TOKEN = 'QUERY_REPOSITORY_PROVIDER_TOKEN';

export interface IQueryRepositoryProvider {
    forResource<T extends IResourceQueryRepository = IResourceQueryRepository>(
        resourceType: string
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

        const queryRepository = this.queryRepositoryProvider.forResource(resourceType);

        if (typeof queryRepository.publish !== 'function') {
            return;
            // TODO log failure
            // throw new InternalError(
            //     `Failed to obtain a query repository with a publish method from query repository provider: ${JSON.stringify(
            //         this.queryRepositoryProvider
            //     )} \n Received the query repository: ${JSON.stringify(queryRepository)} [${
            //         Object.getPrototypeOf(queryRepository).constructor.name
            //     }]`
            // );
        }

        await queryRepository.publish(id);
    }
}
