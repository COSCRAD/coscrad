import { InternalError } from '../../../../lib/errors/InternalError';
import { HasAggregateIdAndLabel } from '../../../interfaces/HasAggregateIdAndLabel';

export default class InvalidExternalStateForCategoryError extends InternalError {
    constructor({ id, label }: HasAggregateIdAndLabel, innerErrors: InternalError[]) {
        const msg = [
            `Encountered invalid external state for category: ${id} (${label}).`,
            `\n See inner errors for more details`,
        ].join(' ');

        super(msg, innerErrors);
    }
}
