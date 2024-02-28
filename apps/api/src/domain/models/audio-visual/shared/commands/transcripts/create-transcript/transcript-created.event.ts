import { CoscradEvent } from '../../../../../../../domain/common';
import { BaseEvent } from '../../../../../shared/events/base-event.entity';
import { CreateTranscript } from './create-transcript.command';

export type TranscriptCreatedPayload = CreateTranscript;

@CoscradEvent('TRANSCRIPT_CREATED')
export class TranscriptCreated extends BaseEvent<TranscriptCreatedPayload> {
    readonly type = 'TRANSCRIPT_CREATED';
}
