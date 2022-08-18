import { InternalError } from '../../../../../../lib/errors/InternalError';
import { EdgeConnectionContextType } from '../../../../../models/context/types/EdgeConnectionContextType';
import InvalidEdgeConnectionContextError from '../../../../errors/context/InvalidEdgeConnectionContextError';

/**
 * This is a test helper. We are using currying because the top-level
 * error is almost always an `InvalidEdgeConnectionContextError` with a fixed
 * `EdgeConnectionContextType` in a given test case.
 */
export default (contextType: EdgeConnectionContextType) => (innerErrors: InternalError[]) =>
    new InvalidEdgeConnectionContextError(contextType, innerErrors);
