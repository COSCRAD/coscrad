import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { PAGE_ADDED_FOR_DIGITAL_TEXT } from '../../constants';

@CoscradEvent(PAGE_ADDED_FOR_DIGITAL_TEXT)
export class PageAddedForDigitalText extends BaseEvent {
    readonly type = PAGE_ADDED_FOR_DIGITAL_TEXT;
}
