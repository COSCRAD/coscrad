import { CoscradEvent } from '../../../common';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { DIGITAL_TEXT_CREATED } from '../constants';

@CoscradEvent(DIGITAL_TEXT_CREATED)
export class DigitalTextCreated extends BaseEvent {
    type = DIGITAL_TEXT_CREATED;
}
