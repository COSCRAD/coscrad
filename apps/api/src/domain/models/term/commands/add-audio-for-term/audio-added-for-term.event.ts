import { BaseEvent } from '../../../shared/events/base-event.entity';
import { AddAudioForTerm } from './add-audio-for-term.command';

export type AudioAddedForTermPayload = AddAudioForTerm;

export class AudioAddedForTerm extends BaseEvent<AudioAddedForTermPayload> {
    type = 'AUDIO_ADDED_FOR_TERM';
}
