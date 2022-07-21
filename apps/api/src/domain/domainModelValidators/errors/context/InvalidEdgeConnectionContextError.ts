import { InternalError } from '../../../../lib/errors/InternalError';
import { EdgeConnectionContextType } from '../../../models/context/types/EdgeConnectionContextType';

export default class InvalidEdgeConnectionContextError extends InternalError {
    constructor(contextType: EdgeConnectionContextType, innerErrors: InternalError[] = []) {
        const message = [`Received an invalid DTO for ${contextType}`].join(' ');

        super(message, innerErrors);
    }
}
