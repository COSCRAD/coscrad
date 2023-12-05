import { InternalError } from '../../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { ResourceCompositeIdentifier } from '../../../context/commands';

export class CannotOverrideDigitalRepresentationError extends InternalError {
    constructor(existingDigitalRepresentationCompositeIdentifier: ResourceCompositeIdentifier) {
        super(
            `Cannot override existing digital representation: ${formatAggregateCompositeIdentifier(
                existingDigitalRepresentationCompositeIdentifier
            )}`
        );
    }
}
