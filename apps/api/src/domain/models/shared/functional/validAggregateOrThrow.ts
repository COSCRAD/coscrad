import { isInternalError } from '../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../types/ResultOrError';
import { Aggregate } from '../../aggregate.entity';

/**
 * TODO Do this in the repository layer instead of returning errors in the
 * `fetchMany` call.
 */
export default <T extends Aggregate>(instanceOrError: ResultOrError<T>): instanceOrError is T => {
    if (isInternalError(instanceOrError)) {
        throw instanceOrError;
    }

    return true;
};
