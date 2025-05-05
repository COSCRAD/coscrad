import { CoscradEvent } from '../../../../../../common';
import { BaseEvent } from '../../../../../shared/events/base-event.entity';
import { TranslateLineItem } from './translate-line-item.command';

export type LineItemTranslatedPayload = TranslateLineItem;

@CoscradEvent('LINE_ITEM_TRANSLATED')
export class LineItemTranslated extends BaseEvent<LineItemTranslatedPayload> {
    readonly type = 'LINE_ITEM_TRANSLATED';
}
