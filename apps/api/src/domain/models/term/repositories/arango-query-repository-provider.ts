import { ResourceType } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../lib/errors/InternalError';
import { AUDIO_QUERY_REPOSITORY_TOKEN } from '../../audio-visual/audio-item/queries/audio-item-query-repository.interface';
import {
    IPublishable,
    IQueryRepositoryProvider,
} from '../../shared/common-commands/publish-resource/resource-published.event-handler';
import { TERM_QUERY_REPOSITORY_TOKEN } from '../queries';

export class ArangoQueryRepositoryProvider implements IQueryRepositoryProvider {
    constructor(
        @Inject(TERM_QUERY_REPOSITORY_TOKEN) private readonly termQueryRepsitory,
        @Inject(AUDIO_QUERY_REPOSITORY_TOKEN) private readonly audioItemQueryRepository
    ) {}

    forResource<T extends IPublishable>(resourceType: ResourceType): T {
        if (resourceType === ResourceType.audioItem) {
            return this.audioItemQueryRepository;
        }

        if (resourceType === ResourceType.term) {
            return this.termQueryRepsitory;
        }

        throw new InternalError(
            `Failed to provide a query repository for unsupported resource type: ${resourceType}`
        );
    }
}
