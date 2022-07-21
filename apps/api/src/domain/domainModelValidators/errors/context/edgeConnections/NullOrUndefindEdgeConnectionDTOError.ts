import { InternalError } from '../../../../../lib/errors/InternalError';

export default class NullOrUndefinedEdgeConnectionDTOError extends InternalError {
    constructor() {
        super(`Encountered a null or undefined DTO for an edge connection`);
    }
}
