import { DTO } from '../../../../../types/DTO';
import { DeepPartial } from '../../../../../types/DeepPartial';
import { Resource } from '../../../resource.entity';
import { Transcript } from '../entities/transcript.entity';
import { CannotOverwriteTranscriptError } from '../transcript-errors/cannot-overwrite-transcript-error';

interface ITranscribable {
    hasTranscript(): boolean;
}

export function createTranscriptImplementation<T extends ITranscribable & Resource>(this: T) {
    if (this.hasTranscript())
        return new CannotOverwriteTranscriptError(this.getCompositeIdentifier());

    return this.safeClone({
        transcript: new Transcript({
            items: [],
            participants: [],
        }),
    } as unknown as DeepPartial<DTO<T>>);
}
