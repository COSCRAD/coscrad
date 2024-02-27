import { isNumberWithinRange } from '@coscrad/validation-constraints';
import { isInternalError } from '../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../types/DTO';
import { DeepPartial } from '../../../../../types/DeepPartial';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Resource } from '../../../resource.entity';
import { TranscriptItem } from '../entities/transcript-item.entity';
import { Transcript } from '../entities/transcript.entity';
import { TranscriptLineItemOutOfBoundsError } from '../transcript-errors/line-item-out-of-bounds.error';

interface Transcribable {
    transcript: Transcript;
    getTimeBounds(): [number, number];
}

export function addLineItemToTranscriptImplementation<T extends Transcribable & Resource>(
    this: T,
    newItemDto: DTO<TranscriptItem>
): ResultOrError<T> {
    const newItem = new TranscriptItem(newItemDto);

    const timeBounds = this.getTimeBounds();

    const { inPointMilliseconds: inPoint, outPointMilliseconds: outPoint } = newItem;

    if ([inPoint, outPoint].some((point) => !isNumberWithinRange(point, timeBounds)))
        return new TranscriptLineItemOutOfBoundsError(newItem, timeBounds);

    const updatedTranscript = this.transcript.addLineItem(new TranscriptItem(newItem));

    if (isInternalError(updatedTranscript)) return updatedTranscript;

    return this.safeClone({
        transcript: updatedTranscript,
    } as DeepPartial<DTO<T>>);
}
