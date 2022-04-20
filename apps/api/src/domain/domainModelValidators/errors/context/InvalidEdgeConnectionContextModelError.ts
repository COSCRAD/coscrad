import { InternalError } from 'apps/api/src/lib/errors/InternalError';

export default class InvalidEdgeConnectionContextModelError extends InternalError {
    constructor(innerErrors: InternalError[]) {
        const msg = `Encountered an invalid DTO for an Edge Connection Context Model`;

        super(msg, innerErrors);
    }
}
