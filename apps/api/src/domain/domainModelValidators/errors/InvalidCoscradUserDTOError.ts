import { InternalError } from '../../../lib/errors/InternalError';

export default class InvalidCoscradUserDTOError extends InternalError {
    constructor(innerErrors: InternalError[], id: string) {
        super(`Received an invalid DTO for user with ID: ${id}`, innerErrors);
    }
}
