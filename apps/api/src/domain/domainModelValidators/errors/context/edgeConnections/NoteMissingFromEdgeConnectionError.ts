import { InternalError } from 'apps/api/src/lib/errors/InternalError';

export default class NoteMissingFromEdgeConnectionError extends InternalError {
    constructor() {
        super(`A note is required when specifying an edge connection`);
    }
}
