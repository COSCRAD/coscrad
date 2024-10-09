import { ResourceType } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../lib/errors/InternalError';
import { AUDIO_QUERY_REPOSITORY_TOKEN } from '../../audio-visual/audio-item/queries/audio-item-query-repository.interface';
import {
    IPublishable,
    IQueryRepositoryProvider,
} from '../../shared/common-commands/publish-resource/resource-published.event-handler';
import { VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN } from '../../vocabulary-list/queries';
import { TERM_QUERY_REPOSITORY_TOKEN } from '../queries';

/**
 * TODO We need to find a pattern to make this more extensible. Maybe we should
 * have a decorator that declares the query repository.
 * @CoscradQueryRepository(ResourceType.term).
 * Then we can use reflection to return the desired repository.
 */
export class ArangoQueryRepositoryProvider implements IQueryRepositoryProvider {
    constructor(
        @Inject(TERM_QUERY_REPOSITORY_TOKEN) private readonly termQueryRepsitory,
        @Inject(AUDIO_QUERY_REPOSITORY_TOKEN) private readonly audioItemQueryRepository,
        @Inject(VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN)
        private readonly vocabularyListQueryRepository
    ) {}

    forResource<T extends IPublishable>(resourceType: ResourceType): T {
        if (resourceType === ResourceType.audioItem) {
            return this.audioItemQueryRepository;
        }

        if (resourceType === ResourceType.term) {
            return this.termQueryRepsitory;
        }

        if (resourceType === ResourceType.vocabularyList) {
            return this.vocabularyListQueryRepository;
        }

        throw new InternalError(
            `Failed to provide a query repository for unsupported resource type: ${resourceType}`
        );
    }
}
