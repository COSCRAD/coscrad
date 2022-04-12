import { InternalError } from 'apps/api/src/lib/errors/InternalError';

export default class EmptyPageRangeError extends InternalError {
    constructor() {
        super(`A page range must include at least one page`);
    }
}
