import { BaseEvent } from '../../../shared/events/base-event.entity';

export class TagRelabelled extends BaseEvent {
    readonly type = 'TAG_RELABELLED';
}
