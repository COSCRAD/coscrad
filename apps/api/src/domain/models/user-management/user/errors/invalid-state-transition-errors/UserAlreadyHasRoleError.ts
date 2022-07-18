import { CoscradUserRole } from '@coscrad/data-types';
import { InternalError } from '../../../../../../lib/errors/InternalError';

export default class UserAlreadyHasRoleError extends InternalError {
    constructor(userId: string, role: CoscradUserRole) {
        super(`The user with ID: ${userId} already has the role: ${role}`);
    }
}
