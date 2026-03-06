import { InternalError } from '../../../../lib/errors/InternalError';

export class SpatialFeatureMustHaveANameError extends InternalError {
    constructor() {
        const msg = `A spatial feature must have at least one of: traditional name, contemporary name`;

        super(msg);
    }
}
