import { InternalError } from '../../../../lib/errors/InternalError';
import { HasEntityIdAndLabel } from '../../../interfaces/HasEntityIdAndLabel';

export default class InvalidExternalStateForCategoryError extends InternalError {
    constructor({ id, label }: HasEntityIdAndLabel, innerErrors: InternalError[]) {
        const msg = [
            `Encountered invalid external state for category: ${id} (${label}).`,
            `\n See inner errors for more details`,
        ].join(' ');

        super(msg, innerErrors);
    }
}
