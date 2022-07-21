import { InternalError } from '../../../../../lib/errors/InternalError';

export default class InvalidEdgeConnectionIDError extends InternalError {
    constructor(id: unknown) {
        super(`Invalid ID for an edge connection dto: ${id}`);
    }
}
