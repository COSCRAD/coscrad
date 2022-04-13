import { InternalError } from 'apps/api/src/lib/errors/InternalError';

export default class InvalidPointTypeError extends InternalError {
    constructor(innerErrors: InternalError[]) {
        super(`Invalid type for point. See inner errors for more details`, innerErrors);
    }
}
