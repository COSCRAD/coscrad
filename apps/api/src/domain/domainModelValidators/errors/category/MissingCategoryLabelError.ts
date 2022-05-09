import { InternalError } from '../../../../lib/errors/InternalError';

export default class MissingCategoryLabelError extends InternalError {
    constructor(categoryId?: string) {
        const msg = [`Missing label for category`, categoryId ? `with id: ${categoryId}` : ''].join(
            ' '
        );

        super(msg);
    }
}
