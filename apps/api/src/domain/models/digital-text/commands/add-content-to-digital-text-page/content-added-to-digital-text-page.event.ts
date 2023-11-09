import { BaseEvent } from '../../../shared/events/base-event.entity';
import { AddContentToDigitalTextPage } from './add-content-to-digital-text-page.command';

export type ContentAddedToDigitalTextPagePayload = AddContentToDigitalTextPage;

export class ContentAddedToDigitalTextPage extends BaseEvent<ContentAddedToDigitalTextPagePayload> {
    type = 'CONTENT_ADDED_TO_DIGITAL_TEXT_PAGE';
}
