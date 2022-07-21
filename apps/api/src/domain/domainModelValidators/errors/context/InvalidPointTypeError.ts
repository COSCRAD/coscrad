import { InternalError } from '../../../../lib/errors/InternalError';

export default class InvalidPointTypeError extends InternalError {
    constructor(innerErrors: InternalError[]) {
        super(`Invalid type for point. See inner errors for more details`, innerErrors);
    }
}
