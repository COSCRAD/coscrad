import { InternalError } from '../../../../../lib/errors/InternalError';

export default class InvalidEdgeConnectionTypeError extends InternalError {
    constructor(invalidType: unknown) {
        super(`Invalid edge connection type: ${invalidType}`);
    }
}
