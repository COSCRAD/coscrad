import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../shared/events/base-event.entity';

const eventType = `AUDIO_ADDED_FOR_DIGITAL_TEXT_PAGE`;

@CoscradEvent(eventType)
export class AudioAddedForDigitalTextPage extends BaseEvent<AudioAddedForDigitalTextPage> {
    type = eventType;
}
