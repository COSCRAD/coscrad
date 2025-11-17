import { CategorizableType } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../common';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../../shared/common-commands/publish-resource/resource-published.event-handler';
import { ResourceOrNoteTagged } from './resource-or-note-tagged.event';

export interface IQueryRepositoryForTaggable {
    tag(id: string, tagId: string): Promise<void>;
}

interface IQueryRepositoryProvider {
    forResource(resourceType: string): IQueryRepositoryForTaggable;
    getNoteRepository(): IQueryRepositoryForTaggable;
}

/**
 * This handler denormalizes the resource or note view, eagerly adding the tag
 * to the corresponding resource view.
 */
@CoscradEventConsumer('RESOURCE_OR_NOTE_TAGGED')
export class TagAddedForResourceOrNoteEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly repositoryProvider: IQueryRepositoryProvider
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: tagId },
            taggedMemberCompositeIdentifier: { type: categorizableType, id: resourceOrNoteId },
        },
    }: ResourceOrNoteTagged): Promise<void> {
        if (categorizableType === CategorizableType.note) {
            await this.repositoryProvider.getNoteRepository().tag(resourceOrNoteId, tagId);

            return;
        }

        await this.repositoryProvider.forResource(categorizableType).tag(resourceOrNoteId, tagId);
    }
}
