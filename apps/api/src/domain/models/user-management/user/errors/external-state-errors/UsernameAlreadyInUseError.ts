import { InternalError } from '../../../../../../lib/errors/InternalError';

export default class UsernameAlreadyInUseError extends InternalError {
    constructor(username: string) {
        super(`There is already a user with the username: ${username}`);
    }
}
