import { BaseEvent } from '../../../../shared/events/base-event.entity';

export class VideoCreated extends BaseEvent {
    readonly type = 'VIDEO_CREATED';
}
