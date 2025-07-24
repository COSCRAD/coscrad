import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../common';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../../shared/common-commands/publish-resource/resource-published.event-handler';
import { ResourceOrNoteTagged } from './resource-or-note-tagged.event';

export interface IQueryRepositoryForTaggable {
    tag(id: string, tagId: string): Promise<void>;
}

interface IQueryRepositoryProvider {
    forResource(resourceType: string): IQueryRepositoryForTaggable;
}

@CoscradEventConsumer('RESOURCE_OR_NOTE_TAGGED')
export class TagAddedForResourceEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly repositoryProvider: IQueryRepositoryProvider
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: tagId },
            taggedMemberCompositeIdentifier: { type: resourceType, id: resourceId },
        },
    }: ResourceOrNoteTagged): Promise<void> {
        await this.repositoryProvider.forResource(resourceType).tag(resourceId, tagId);
    }
}
