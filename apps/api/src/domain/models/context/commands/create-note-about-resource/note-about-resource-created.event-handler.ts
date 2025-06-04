import { IMultilingualText } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { DTO } from '../../../../../types/DTO';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../../shared/common-commands/publish-resource/resource-published.event-handler';
import { EdgeConnectionContext } from '../../context.entity';
import { NoteAboutResourceCreated } from './note-about-resource-created.event';

export interface INoteCreationDto {
    noteId: AggregateId;
    context: DTO<EdgeConnectionContext>;
    text: IMultilingualText;
}

export interface IQueryRepositoryForAnnotatable {
    createNoteAbout(id: string, dto: INoteCreationDto): Promise<void>;
}

interface IQueryRepositoryProvider {
    forResource(resourceType: string): IQueryRepositoryForAnnotatable;
}

@CoscradEventConsumer('NOTE_ABOUT_RESOURCE_CREATED')
export class NoteAboutResourceCreatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly repositoryProvider: IQueryRepositoryProvider
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: noteId },
            resourceContext,
            resourceCompositeIdentifier: { type: resourceType, id: resourceId },
            text,
            languageCode,
        },
    }: NoteAboutResourceCreated): Promise<void> {
        await this.repositoryProvider.forResource(resourceType).createNoteAbout(resourceId, {
            noteId,
            context: resourceContext,
            // could this mapping happen in command payload -> event payload?
            text: buildMultilingualTextWithSingleItem(text, languageCode),
        });
    }
}
