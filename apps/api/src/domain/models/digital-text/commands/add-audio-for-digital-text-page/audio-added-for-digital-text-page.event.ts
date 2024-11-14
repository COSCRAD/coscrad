import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { AddAudioForDigitalTextPage } from './add-audio-for-digital-text-page.command';

export type AudioAddedForDigitalTextPagePayload = AddAudioForDigitalTextPage;

@CoscradEvent(`AUDIO_ADDED_FOR_DIGITAL_TEXT_PAGE`)
export class AudioAddedForDigitalTextPage extends BaseEvent<AudioAddedForDigitalTextPagePayload> {
    readonly type = `AUDIO_ADDED_FOR_DIGITAL_TEXT_PAGE`;
}
