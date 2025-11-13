import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import {
    INoteQueryRepository,
    NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../repositories/note-query-repository.interface';
import { AudioAddedForNote } from './audio-added-for-note.event';

@CoscradEventConsumer('AUDIO_ADDED_FOR_NOTE')
export class AudioAddedForNoteEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly queryRepository: INoteQueryRepository
    ) {}

    async handle({
        payload: {
            audioItemId,
            languageCode,
            aggregateCompositeIdentifier: { id: noteId },
        },
    }: AudioAddedForNote): Promise<void> {
        await this.queryRepository.addAudio(noteId, audioItemId, languageCode);
    }
}
