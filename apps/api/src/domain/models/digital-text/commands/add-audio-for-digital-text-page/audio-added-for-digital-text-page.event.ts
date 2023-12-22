import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { AddAudioForDigitalTextPage } from './add-audio-for-digital-text-page.command';

const eventType = `AUDIO_ADDED_FOR_DIGITAL_TEXT_PAGE`;

export type AudioAddedForDigitalTextPagePayload = AddAudioForDigitalTextPage;

@CoscradEvent(eventType)
export class AudioAddedForDigitalTextPage extends BaseEvent<AudioAddedForDigitalTextPagePayload> {
    type = eventType;
}
