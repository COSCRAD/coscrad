import { InternalError } from '../../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateCompositeIdentifier } from '../../../../types/AggregateCompositeIdentifier';

export class TranscriptDoesNotExistError extends InternalError {
    constructor(aggregateCompositeIdentifier: AggregateCompositeIdentifier) {
        super(
            `${formatAggregateCompositeIdentifier(
                aggregateCompositeIdentifier
            )} does not have a transcript`
        );
    }
}
