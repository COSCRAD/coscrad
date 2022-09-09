import { InternalError } from '../../../../lib/errors/InternalError';
import { AggregateId } from '../../../types/AggregateId';

/**
 * **WORD OF CAUTION** This error covers the case that, although no existing
 * aggregate of the given type was found with the ID, our ID generation system
 * has marked the ID as not available.
 */
export default class AggregateIdNotAvailableError extends InternalError {
    constructor(invalidId: AggregateId) {
        super(`The ID: ${invalidId} is not available for use`);
    }
}
