import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { PageIdentifier } from '../entities';

export class CannotOverwritePhotographForPageError extends InternalError {
    constructor(
        pageIdentifier: PageIdentifier,
        newPhotographId: AggregateId,
        existingPhotographId: AggregateId
    ) {
        const message = `You cannot add the photograph ${formatAggregateCompositeIdentifier({
            type: AggregateType.photograph,
            id: newPhotographId,
        })} for page ${pageIdentifier} as it is already linked to ${formatAggregateCompositeIdentifier(
            { type: AggregateType.photograph, id: existingPhotographId }
        )}`;

        super(message);
    }
}
