import { InternalError } from '../../../../lib/errors/InternalError';

export default class InvalidCategoryDTOError extends InternalError {
    constructor(innerErrors: InternalError[]) {
        const msg = [
            `Encountered an invalid DTO for a category.`,
            `\n Please see inner errors for more details.`,
        ].join(' ');

        super(msg, innerErrors);
    }
}
