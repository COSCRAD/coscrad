import { InternalError } from '../../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../../types/AggregateId';
import { AggregateType } from '../../../../types/AggregateType';

export class FailedToRegisterDigitalRepresentationError extends InternalError {
    constructor(bibliographicReferenceId: AggregateId, innerErrors: InternalError[]) {
        super(
            `Failed to register a digital representation for: ${formatAggregateCompositeIdentifier({
                type: AggregateType.bibliographicReference,
                id: bibliographicReferenceId,
            })}`,
            innerErrors
        );
    }
}
