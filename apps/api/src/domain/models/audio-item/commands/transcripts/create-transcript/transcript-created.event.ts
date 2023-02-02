import { BaseEvent } from '../../../../shared/events/base-event.entity';

export class TranscriptCreated extends BaseEvent {
    readonly type = 'TRANSCRIPT_CREATED';
}
