import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { AddAudioForDigitalTextTitle } from './add-audio-for-digital-text-title.command';

const eventType = `AUDIO_ADDED_FOR_DIGITAL_TEXT_TITLE`;

export type AudioAddedForDigitalTextTitlePayload = AddAudioForDigitalTextTitle;

@CoscradEvent(eventType)
export class AudioAddedForDigitalTextTitle extends BaseEvent<AudioAddedForDigitalTextTitlePayload> {
    type = eventType;
}
