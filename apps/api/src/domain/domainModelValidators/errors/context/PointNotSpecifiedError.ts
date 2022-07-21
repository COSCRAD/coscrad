import { InternalError } from '../../../../lib/errors/InternalError';

export default class PointNotSpecifiedError extends InternalError {
    constructor() {
        super(`You must specify a point as part of a point context`);
    }
}
