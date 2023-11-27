import { InternalError } from '../../../../../../lib/errors/InternalError';

export class EmptyPageRangeContextError extends InternalError {
    constructor() {
        super(`A page range context must include at least one page identifier`);
    }
}
