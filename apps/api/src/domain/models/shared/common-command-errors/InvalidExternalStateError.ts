import { InternalError } from '../../../../lib/errors/InternalError';

export default class InvalidExternalStateError extends InternalError {
    constructor(innerErrors: InternalError[]) {
        super(`The command failed due to a conflict with existing data`, innerErrors);
    }
}
