import { isInternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound } from '../../../lib/types/not-found';
import { ResultOrError } from '../../../types/ResultOrError';
import httpStatusCodes, { HttpStatusCode } from '../../constants/httpStatusCodes';

const getStatusCodeForResult = <T>(result: ResultOrError<Maybe<T>>): HttpStatusCode => {
    if (isNotFound(result)) return httpStatusCodes.notFound;

    /**
     *  Note that a true internal error should be thrown and not returned. We
     * might want to consider naming our base error class `CoscradError` and then
     * having separate subclasses `InternalError` and `BadRequest`. To be explicit,
     * we could even call the former `CoscradException`; the latter may be
     * unnecessary.
     */
    if (isInternalError(result)) return httpStatusCodes.badRequest;

    // If we've made it this far, we have a valid result
    return httpStatusCodes.ok;
};

const getBodyForResult = <T>(result: ResultOrError<Maybe<T>>) => {
    if (isNotFound(result)) return undefined;

    if (isInternalError(result))
        return {
            error: result.toString(),
        };

    // TODO convert instances to plain objects here
    return result;
};

export default <T>(res, result: ResultOrError<Maybe<T>>) =>
    // This also takes care of converting results that are class instances to DTOs
    res.status(getStatusCodeForResult(result)).send(getBodyForResult(result));
