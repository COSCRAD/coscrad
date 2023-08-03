import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { LINE_ITEM_TRANSLATED } from './constants';

export class LineItemTranslated extends BaseEvent {
    type = LINE_ITEM_TRANSLATED;
}
