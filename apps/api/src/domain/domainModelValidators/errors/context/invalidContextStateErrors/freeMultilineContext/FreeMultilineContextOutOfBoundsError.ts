import { InternalError } from '../../../../../../lib/errors/InternalError';
import formatResourceCompositeIdentifier from '../../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateCompositeIdentifier } from '../../../../../types/AggregateCompositeIdentifier';

export default class FreeMultilineContextOutOfBoundsError extends InternalError {
    constructor(
        resourceCompositeIdentifier: AggregateCompositeIdentifier,
        innerErrors: InternalError[]
    ) {
        const msg = [
            `Free multiline context`,
            `refers to lines that are inconsistent with`,
            `resource: ${formatResourceCompositeIdentifier(resourceCompositeIdentifier)}`,
            '\n',
            `See inner errors for more details.`,
        ].join(' ');

        super(msg, innerErrors);
    }
}
