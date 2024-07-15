import { InternalError } from '../../../../lib/errors/InternalError';

export class EmptyPageImportError extends InternalError {
    constructor() {
        super(`You must provide at least one page when importing pages to a digital text`);
    }
}
