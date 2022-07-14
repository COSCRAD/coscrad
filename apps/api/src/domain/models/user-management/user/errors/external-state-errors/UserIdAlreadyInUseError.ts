import { InternalError } from '../../../../../../lib/errors/InternalError';
import { AggregateId } from '../../../../../types/AggregateId';

export default class UserIdAlreadyInUseError extends InternalError {
    constructor(userId: AggregateId) {
        super(`There is already a user with ID: ${userId}`);
    }
}
