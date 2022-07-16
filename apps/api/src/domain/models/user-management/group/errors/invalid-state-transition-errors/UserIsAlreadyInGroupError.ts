import { InternalError } from '../../../../../../lib/errors/InternalError';
import { AggregateId } from '../../../../../types/AggregateId';
import { CoscradUserGroup } from '../../entities/coscrad-user-group.entity';

export default class UserIsAlreadyInGroupError extends InternalError {
    constructor(userId: AggregateId, { id, label }: CoscradUserGroup) {
        super(`The user with ID: ${userId} is already in group: ${id} (${label})`);
    }
}
