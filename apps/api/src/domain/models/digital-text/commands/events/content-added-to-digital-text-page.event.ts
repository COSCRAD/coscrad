import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { AddContentToDigitalTextPage } from '../add-content-to-digital-text-page/add-content-to-digital-text-page.command';

export type ContentAddedToDigitalTextPagePayload = AddContentToDigitalTextPage;

const eventType = 'CONTENT_ADDED_TO_DIGITAL_TEXT_PAGE';

/**
 * TODO It seems that if event type is a constant we might be able to use reflection
 * to access this value on the prototype chain and avoid needing an argument
 * in the following decorator factory.
 */
@CoscradEvent(eventType)
export class ContentAddedToDigitalTextPage extends BaseEvent<ContentAddedToDigitalTextPagePayload> {
    type = eventType;
}
