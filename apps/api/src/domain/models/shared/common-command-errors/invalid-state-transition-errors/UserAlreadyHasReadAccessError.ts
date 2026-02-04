import { CategorizableCompositeIdentifier } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../../types/AggregateId';

export default class UserAlreadyHasReadAccessError extends InternalError {
    constructor(userId: AggregateId, compositeIdentifier: CategorizableCompositeIdentifier) {
        super(
            [
                `The user with ID: ${userId}`,
                `already has read access to:`,
                formatAggregateCompositeIdentifier(compositeIdentifier),
            ].join(' ')
        );
    }
}
