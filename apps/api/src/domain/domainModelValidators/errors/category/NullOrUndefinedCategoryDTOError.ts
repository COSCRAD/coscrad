import { InternalError } from '../../../../lib/errors/InternalError';

export default class NullOrUndefinedCategoryDTOError extends InternalError {
    constructor() {
        const msg = `Received a null or undefined DTO for a category`;

        super(msg);
    }
}
