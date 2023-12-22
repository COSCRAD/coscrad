import { InternalError } from '../../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../../types/AggregateId';
import { AggregateType } from '../../../../types/AggregateType';

export class FailedToRegisterDigitalRepresentationError extends InternalError {
    constructor(bibliographicCitationId: AggregateId, innerErrors: InternalError[]) {
        super(
            `Failed to register a digital representation for: ${formatAggregateCompositeIdentifier({
                type: AggregateType.bibliographicCitation,
                id: bibliographicCitationId,
            })}`,
            innerErrors
        );
    }
}
