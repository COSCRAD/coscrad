import { InternalError } from '../../../../../lib/errors/InternalError';

export default class InvalidEdgeConnectionDTOError extends InternalError {
    constructor(innerErrors?: InternalError[]) {
        const msg = [
            `Encountered an invalid DTO for an Edge Connection`,
            `See innerErrors for more details`,
        ].join('\n');
        super(msg, innerErrors);
    }
}
