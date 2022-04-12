import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { EdgeConnectionContextType } from '../../../models/context/types/EdgeConnectionContextType';

export default class NullOrUndefinedResourceDTOError extends InternalError {
    constructor(contextType?: EdgeConnectionContextType) {
        const message = [
            `A null or undefined DTO was provided`,
            contextType ? `for entity of type ${contextType}` : ``,
        ].join(' ');

        super(message);
    }
}
