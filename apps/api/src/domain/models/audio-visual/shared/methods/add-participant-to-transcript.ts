import { isInternalError } from '../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../types/DTO';
import { DeepPartial } from '../../../../../types/DeepPartial';
import { Resource } from '../../../resource.entity';
import { TranscriptParticipant } from '../entities/transcript-participant';
import { Transcript } from '../entities/transcript.entity';
import { CannotAddParticipantBeforeCreatingTranscriptError } from '../transcript-errors/cannot-add-participant-before-creating-transcript.error';

interface HasTranscript {
    transcript: Transcript;
    hasTranscript(): boolean;
}

export function addParticipantToTranscriptImplementation<T extends HasTranscript & Resource>(
    this: T,
    participant: TranscriptParticipant
) {
    if (!this.hasTranscript())
        return new CannotAddParticipantBeforeCreatingTranscriptError(this.getCompositeIdentifier());

    const updatedTranscript = this.transcript.addParticipant(participant);

    if (isInternalError(updatedTranscript)) return updatedTranscript;

    return this.safeClone({
        transcript: updatedTranscript,
    } as DeepPartial<DTO<T>>);
}
