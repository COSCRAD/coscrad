import { InternalError } from '../../../../lib/errors/InternalError';

export class MissingOriginalTextItemInPageImportError extends InternalError {
    constructor() {
        super(
            `You must provide 1 (and only 1) original text item for each page when importing pages`
        );
    }
}
