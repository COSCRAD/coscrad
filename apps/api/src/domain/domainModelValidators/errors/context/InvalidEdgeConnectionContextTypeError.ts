import { InternalError } from 'apps/api/src/lib/errors/InternalError';

export default class InvalidEdgeConnectionContextTypeError extends InternalError {
    constructor(type: unknown) {
        super(`Invalid edge connection context type: ${type}`);
    }
}
