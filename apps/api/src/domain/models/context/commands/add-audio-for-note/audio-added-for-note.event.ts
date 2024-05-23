import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { AddAudioForNote } from './add-audio-for-note.command';

export type AudioAddedForNotePayload = AddAudioForNote;

@CoscradEvent('AUDIO_ADDED_FOR_NOTE')
export class AudioAddedForNote extends BaseEvent<AudioAddedForNotePayload> {
    readonly type = 'AUDIO_ADDED_FOR_NOTE';
}
