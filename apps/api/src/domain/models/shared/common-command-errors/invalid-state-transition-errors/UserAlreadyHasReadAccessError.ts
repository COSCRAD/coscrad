import { InternalError } from '../../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../../types/AggregateId';
import { ResourceCompositeIdentifier } from '../../../../types/ResourceCompositeIdentifier';

export default class UserAlreadyHasReadAccessError extends InternalError {
    constructor(userId: AggregateId, resourceCompositeIdentifier: ResourceCompositeIdentifier) {
        super(
            [
                `The user with ID: ${userId}`,
                `already has read access to:`,
                formatAggregateCompositeIdentifier(resourceCompositeIdentifier),
            ].join(' ')
        );
    }
}
