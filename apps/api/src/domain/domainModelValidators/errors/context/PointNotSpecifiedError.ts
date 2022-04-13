import { InternalError } from 'apps/api/src/lib/errors/InternalError';

export default class PointNotSpecifiedError extends InternalError {
    constructor() {
        super(`You must specify a point as part of a point context`);
    }
}
