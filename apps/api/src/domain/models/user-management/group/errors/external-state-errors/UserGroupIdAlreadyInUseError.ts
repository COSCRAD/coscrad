import { InternalError } from '../../../../../../lib/errors/InternalError';
import { AggregateId } from '../../../../../types/AggregateId';

export class UserGroupIdAlreadyInUseError extends InternalError {
    constructor(groupId: AggregateId) {
        super(`There is already a user group with the ID: ${groupId}`);
    }
}
