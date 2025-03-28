import { InternalError } from '../../../../lib/errors/InternalError';
import { AggregateId } from '../../../types/AggregateId';

export default class UuidAlreadyInUseError extends InternalError {
    constructor(invalidId: AggregateId) {
        super(`The UUID: ${invalidId} is not available because it is already in use`);
    }
}
