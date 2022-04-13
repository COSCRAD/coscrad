import { InternalError } from 'apps/api/src/lib/errors/InternalError';

export default class EmptyTimeRangeContextError extends InternalError {
    constructor() {
        super(`The time range must be specified as part of a time range context`);
    }
}
