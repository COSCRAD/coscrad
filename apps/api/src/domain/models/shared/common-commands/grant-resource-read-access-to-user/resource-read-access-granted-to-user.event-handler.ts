import { ResourceType } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { ICoscradEventHandler } from '../../../../../domain/common';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../publish-resource/resource-published.event-handler';
import { ResourceReadAccessGrantedToUser } from './resource-read-access-granted-to-user.event';

export interface IAccessible {
    allowUser(aggregateId: AggregateId, userId: AggregateId): Promise<void>;
}

interface IRepoProvider {
    forResource(resourceType: ResourceType): IAccessible;
}

export class ResourceReadAccessGrantedToUserEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly queryRepositoryProvider: IRepoProvider
    ) {}

    async handle(event: ResourceReadAccessGrantedToUser): Promise<void> {
        const {
            payload: {
                aggregateCompositeIdentifier: { id, type: resourceType },
                userId,
            },
        } = event;

        if (
            ![
                ResourceType.song,
                ResourceType.video,
                ResourceType.audioItem,
                ResourceType.term,
                ResourceType.vocabularyList,
                ResourceType.photograph,
            ].includes(resourceType)
        ) {
            // TODO support all resource types
            return;
        }

        const targetRepository = this.queryRepositoryProvider.forResource(resourceType);

        await targetRepository.allowUser(id, userId);
    }
}
