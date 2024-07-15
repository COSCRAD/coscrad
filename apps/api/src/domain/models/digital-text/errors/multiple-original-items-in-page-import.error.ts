import { InternalError } from '../../../../lib/errors/InternalError';

export class MultipleOriginalItemsInPageImportError extends InternalError {
    constructor() {
        super(`You must specify 1 (and only 1) original text item per page when importing pages`);
    }
}
