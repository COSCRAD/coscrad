import { BaseEvent } from '../../../../shared/events/base-event.entity';

export class ParticipantAddedToTranscript extends BaseEvent {
    readonly type = `PARTICIPANT_ADDED_TO_TRANSCRIPT`;
}
