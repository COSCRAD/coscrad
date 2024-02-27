import { isNumberWithinRange } from '@coscrad/validation-constraints';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
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

// TODO Do we ensure that there must be at least one line item here?(
export function importLineItemsToTranscriptImplementation<T extends Transcribable & Resource>(
    this: T,
    newItemDtos: DTO<TranscriptItem>[]
): ResultOrError<T> {
    const newItems = newItemDtos.map((newItemDto) => new TranscriptItem(newItemDto));

    const outOfBoundsErrors = newItems.reduce((allErrors: InternalError[], item) => {
        const { inPointMilliseconds: inPoint, outPointMilliseconds: outPoint } = item;

        const timeBounds = this.getTimeBounds();

        return [inPoint, outPoint].some((point) => !isNumberWithinRange(point, timeBounds))
            ? allErrors.concat(new TranscriptLineItemOutOfBoundsError(item, timeBounds))
            : allErrors;
    }, []);

    if (outOfBoundsErrors.length > 0)
        return new InternalError(
            `Failed to import line items as one or more items are out of bounds`,
            outOfBoundsErrors
        );

    // Shouldn't we null check Transcript here?

    const transcriptUpdateResult = this.transcript.importLineItems(newItems);

    if (isInternalError(transcriptUpdateResult)) return transcriptUpdateResult;

    return this.safeClone({
        transcript: transcriptUpdateResult,
    } as DeepPartial<DTO<T>>);
}
