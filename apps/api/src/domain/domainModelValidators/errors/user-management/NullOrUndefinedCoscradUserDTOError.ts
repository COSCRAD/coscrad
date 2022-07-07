import { InternalError } from '../../../../lib/errors/InternalError';

export default class NullOrUndefinedCoscradUserDTOError extends InternalError {
    constructor() {
        super(`Encountered an undefined DTO for a user`);
    }
}
