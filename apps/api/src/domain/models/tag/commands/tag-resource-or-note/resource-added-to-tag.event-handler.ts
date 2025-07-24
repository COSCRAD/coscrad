import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import {
    ITagQueryRepository,
    TAG_QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../repositories/tag-query-repository.interface';
import { ResourceOrNoteTagged } from './resource-or-note-tagged.event';

@CoscradEventConsumer('RESOURCE_OR_NOTE_TAGGED')
export class ResourceAddedToTagEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(TAG_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly repository: ITagQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: tagId },
            taggedMemberCompositeIdentifier,
        },
    }: ResourceOrNoteTagged): Promise<void> {
        await this.repository.tagResourceOrNote(tagId, taggedMemberCompositeIdentifier);
    }
}
