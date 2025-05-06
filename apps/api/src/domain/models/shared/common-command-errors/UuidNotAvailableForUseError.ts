import { InternalError } from '../../../../lib/errors/InternalError';
import { AggregateId } from '../../../types/AggregateId';

export default class UuidAlreadyInUseError extends InternalError {
    constructor(invalidId: AggregateId) {
        super(`The ID: ${invalidId} is not available for use`);
    }
}
