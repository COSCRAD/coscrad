import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { AUDIO_ITEM_NAME_TRANSLATED } from '../constants';

export class AudioItemNameTranslated extends BaseEvent {
    readonly type = AUDIO_ITEM_NAME_TRANSLATED;
}
