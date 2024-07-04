import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { PAGE_ADDED_TO_DIGITAL_TEXT } from '../../constants';
import { AddPageToDigitalText } from '../add-page-to-digital-text/add-page-to-digital-text.command';

export type PageAddedToDigitalTextPayload = AddPageToDigitalText;

@CoscradEvent(PAGE_ADDED_TO_DIGITAL_TEXT)
export class PageAddedToDigitalText extends BaseEvent<PageAddedToDigitalTextPayload> {
    readonly type = PAGE_ADDED_TO_DIGITAL_TEXT;
}
