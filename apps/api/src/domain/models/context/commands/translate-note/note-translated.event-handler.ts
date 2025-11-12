import { MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import {
    INoteQueryRepository,
    NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../repositories/note-query-repository.interface';
import { NoteTranslated } from './note-translated.event';

@CoscradEventConsumer('NOTE_TRANSLATED')
export class NoteTranslatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly queryRepository: INoteQueryRepository
    ) {}

    async handle({
        payload: {
            text,
            languageCode,
            aggregateCompositeIdentifier: { id: noteId },
        },
    }: NoteTranslated): Promise<void> {
        await this.queryRepository.translate(noteId, {
            text,
            languageCode,
            role: MultilingualTextItemRole.original,
        });
    }
}
