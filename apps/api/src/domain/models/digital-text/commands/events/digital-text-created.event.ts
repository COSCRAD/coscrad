import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { DIGITAL_TEXT_CREATED } from '../../constants';
import { CreateDigitalText } from '../create-digital-text.command';

export type DigitalTextCreatedPayload = CreateDigitalText;

@CoscradEvent(DIGITAL_TEXT_CREATED)
export class DigitalTextCreated extends BaseEvent<DigitalTextCreatedPayload> {
    type = DIGITAL_TEXT_CREATED;
}
