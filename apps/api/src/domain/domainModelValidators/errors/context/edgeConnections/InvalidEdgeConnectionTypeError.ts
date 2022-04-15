import { InternalError } from 'apps/api/src/lib/errors/InternalError';

export default class InvalidEdgeConnectionTypeError extends InternalError {
    constructor(invalidType: unknown) {
        super(`Invalid edge connection type: ${invalidType}`);
    }
}
