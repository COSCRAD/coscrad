import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../../shared/common-commands/publish-resource/resource-published.event-handler';
import { NoteAboutResourceCreated } from './note-about-resource-created.event';
import {
    INoteCreationDto,
    IQueryRepositoryForAnnotatable,
} from './note-about-resource-created.event-handler';

interface IRepositoryProvider {
    forResource(resourceType: string): IQueryRepositoryForAnnotatable;
}

@CoscradEventConsumer('NOTE_ABOUT_RESOURCE_CREATED')
export class ResourceNoteDenormalizer implements ICoscradEventHandler {
    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly repositoryProvider: IRepositoryProvider
    ) {}

    async handle(event: NoteAboutResourceCreated): Promise<void> {
        const {
            payload: {
                aggregateCompositeIdentifier: { id: noteId },
                resourceCompositeIdentifier: { type: resourceType, id: resourceId },
                resourceContext,
                text: textForNote,
                languageCode,
            },
        } = event;

        const noteCreationDto: INoteCreationDto = {
            noteId,
            context: resourceContext,
            text: buildMultilingualTextWithSingleItem(textForNote, languageCode),
        };

        const repository = this.repositoryProvider.forResource(resourceType);

        await repository.createNoteAbout(resourceId, noteCreationDto);
    }
}
