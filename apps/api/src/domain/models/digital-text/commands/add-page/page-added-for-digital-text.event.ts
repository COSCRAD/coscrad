import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { PAGE_ADDED_FOR_DIGITAL_TEXT } from '../../constants';
import { AddPageForDigitalText } from './add-page-for-digital-text.command';

export type PageAddedForDigitalTextPayload = AddPageForDigitalText;

@CoscradEvent(PAGE_ADDED_FOR_DIGITAL_TEXT)
export class PageAddedForDigitalText extends BaseEvent<PageAddedForDigitalTextPayload> {
    readonly type = PAGE_ADDED_FOR_DIGITAL_TEXT;
}
