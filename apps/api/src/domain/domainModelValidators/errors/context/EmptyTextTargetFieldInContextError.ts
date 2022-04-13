import { InternalError } from 'apps/api/src/lib/errors/InternalError';

export default class EmptyTextTargetFieldInContextError extends InternalError {
    constructor() {
        super(`When specifying a text field context you must specify the target field`);
    }
}
