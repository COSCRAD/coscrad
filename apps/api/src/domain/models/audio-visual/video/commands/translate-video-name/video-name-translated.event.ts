import { BaseEvent } from '../../../shared/events/base-event.entity';

export class VideoNameTranslated extends BaseEvent {
    readonly type = 'VIDEO_NAME_TRANSLATED';
}
