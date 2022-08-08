import { InternalError } from '../../../../lib/errors/InternalError';

/**
 * TODO We also generate this error when validating existing state (e.g. in
 * validating staging / test data and possib ly some day in validating existing
 * live data). Can we update the message so it makes sense in both contexts?
 */
export default class InvalidExternalStateError extends InternalError {
    constructor(innerErrors: InternalError[]) {
        super(`The provided data is inconsistent with existing data`, innerErrors);
    }
}
