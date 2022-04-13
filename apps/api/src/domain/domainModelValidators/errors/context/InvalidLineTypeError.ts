import { InternalError } from 'apps/api/src/lib/errors/InternalError';

export default class InvalidLineTypeError extends InternalError {
    constructor(input: unknown) {
        super(`Invalid type for a line or linear structure: ${typeof input}`);
    }
}
