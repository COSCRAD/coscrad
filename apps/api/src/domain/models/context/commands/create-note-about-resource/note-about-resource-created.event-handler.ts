import { EdgeConnectionType, IMultilingualText } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { DTO } from '../../../../../types/DTO';
import { EdgeConnectionContext } from '../../context.entity';
import {
    INoteQueryRepository,
    NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../repositories/note-query-repository.interface';
import { NoteAboutResourceCreated } from './note-about-resource-created.event';

export interface INoteCreationDto {
    noteId: AggregateId;
    context: DTO<EdgeConnectionContext>;
    // should this be `IMultilingualTextItem`?
    text: IMultilingualText;
}

export interface IQueryRepositoryForAnnotatable {
    createNoteAbout(id: string, dto: INoteCreationDto): Promise<void>;
}

@CoscradEventConsumer('NOTE_ABOUT_RESOURCE_CREATED')
export class NoteAboutResourceCreatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly noteRepository: INoteQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: noteId },
            resourceContext,
            resourceCompositeIdentifier,
            text,
            languageCode,
        },
    }: NoteAboutResourceCreated): Promise<void> {
        await this.noteRepository.createNoteAbout(
            {
                id: noteId,
                text: buildMultilingualTextWithSingleItem(text, languageCode),
                connectionType: EdgeConnectionType.self,
            },
            resourceCompositeIdentifier,
            resourceContext
        );
    }
}
