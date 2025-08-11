import { CategorizableCompositeIdentifier, CategorizableType } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { Maybe } from '../../../../../lib/types/maybe';
import { isNotFound } from '../../../../../lib/types/not-found';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../../shared/common-commands/publish-resource/resource-published.event-handler';
import {
    ITagQueryRepository,
    TAG_QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../repositories/tag-query-repository.interface';
import { ResourceOrNoteTagged } from './resource-or-note-tagged.event';

interface QueryRepositoryForTaggable<T = unknown> {
    fetchById(id: AggregateId): Promise<Maybe<T>>;
}

interface IQueryRepositoryProvider {
    // TODO [https://coscrad.atlassian.net/browse/CWEBJIRA-273] note test case
    forResource<T = unknown>(categorizableType: CategorizableType): QueryRepositoryForTaggable<T>;
}

@CoscradEventConsumer('RESOURCE_OR_NOTE_TAGGED')
export class ResourceAddedToTagEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(TAG_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly repository: ITagQueryRepository,
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly categorizableRepositoryProvider: IQueryRepositoryProvider
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: tagId },
            taggedMemberCompositeIdentifier: { type: categorizableType, id: categorizableId },
        },
    }: ResourceOrNoteTagged): Promise<void> {
        const categorizableRepo =
            this.categorizableRepositoryProvider.forResource<CategorizableCompositeIdentifier>(
                categorizableType
            );

        const categorizableDoc = await categorizableRepo.fetchById(categorizableId);

        if (isNotFound(categorizableDoc)) {
            // TODO log system error
            return;
        }

        await this.repository.tagResourceOrNote(tagId, categorizableDoc);
    }
}
