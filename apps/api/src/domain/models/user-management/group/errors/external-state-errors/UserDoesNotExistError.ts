import { InternalError } from '../../../../../../lib/errors/InternalError';
import { AggregateId } from '../../../../../types/AggregateId';

export class UserDoesNotExistError extends InternalError {
    constructor(userId: AggregateId) {
        super(`There is no user with the ID: ${userId}`);
    }
}
