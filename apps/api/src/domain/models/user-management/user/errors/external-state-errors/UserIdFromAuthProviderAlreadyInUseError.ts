import { InternalError } from '../../../../../../lib/errors/InternalError';

export default class UserIdFromAuthProviderAlreadyInUseError extends InternalError {
    constructor(authProviderUserId: string) {
        super(`There is already a user with auth provider assigned ID: ${authProviderUserId}`);
    }
}
