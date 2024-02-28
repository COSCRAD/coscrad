import { Resource } from '../../../resource.entity';
import { Transcript } from '../entities/transcript.entity';
import { CannotOverwriteTranscriptError } from '../transcript-errors/cannot-overwrite-transcript-error';

interface ITranscribable {
    transcript: Transcript;
    hasTranscript(): boolean;
}

export function createTranscriptImplementation<T extends ITranscribable & Resource>(this: T) {
    if (this.hasTranscript())
        return new CannotOverwriteTranscriptError(this.getCompositeIdentifier());

    this.transcript = new Transcript({
        items: [],
        participants: [],
    });

    return this;
}
