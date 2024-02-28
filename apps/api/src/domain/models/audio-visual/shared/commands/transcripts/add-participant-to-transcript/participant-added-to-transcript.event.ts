import { CoscradEvent } from '../../../../../../../domain/common';
import { BaseEvent } from '../../../../../shared/events/base-event.entity';
import { AddParticipantToTranscript } from './add-participant-to-transcript.command';

export type ParticipantAddedToTranscriptPayload = AddParticipantToTranscript;

@CoscradEvent(`PARTICIPANT_ADDED_TO_TRANSCRIPT`)
export class ParticipantAddedToTranscript extends BaseEvent<ParticipantAddedToTranscriptPayload> {
    readonly type = `PARTICIPANT_ADDED_TO_TRANSCRIPT`;
}
