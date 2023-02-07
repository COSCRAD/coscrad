import { InternalError } from '../../../../lib/errors/InternalError';
import formatPosition2D from '../../../../view-models/presentation/formatPosition2D';
import { TranscriptItem } from '../entities/transcript-item.entity';

export class TranscriptLineItemOutOfBoundsError extends InternalError {
    constructor(lineItem: TranscriptItem, bounds: [number, number]) {
        super(
            `The line item: ${lineItem.toString()} falls outside the bounds: ${formatPosition2D(
                bounds
            )}`
        );
    }
}
