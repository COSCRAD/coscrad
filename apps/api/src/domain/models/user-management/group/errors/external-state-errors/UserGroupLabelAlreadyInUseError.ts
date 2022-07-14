import { InternalError } from '../../../../../../lib/errors/InternalError';

export class UserGroupLabelAlreadyInUseError extends InternalError {
    constructor(label: string) {
        super(`There is already a user group with the label: ${label}`);
    }
}
