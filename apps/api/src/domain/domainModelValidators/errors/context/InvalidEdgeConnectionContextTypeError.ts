import { InternalError } from '../../../../lib/errors/InternalError';

export default class InvalidEdgeConnectionContextTypeError extends InternalError {
    constructor(type: unknown) {
        super(`Invalid edge connection context type: ${type}`);
    }
}
