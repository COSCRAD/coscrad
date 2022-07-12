import { InternalError } from '../../../lib/errors/InternalError';

export default class InvalidCoscradUserGroupDTOError extends InternalError {
    constructor(innerErrors: InternalError[], id: string) {
        super(`Encountered an invalid DTO for user group with ID: ${id}`, innerErrors);
    }
}
