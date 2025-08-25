import { InternalError } from '../../../../lib/errors/InternalError';
import { AggregateId } from '../../../types/AggregateId';
import { formatMemoryRoundCompositeId } from './format-memory-round-composite-id';

export class MemoryRoundIsNotReadyForPublicationError extends InternalError {
    constructor(roundId: AggregateId, innerErrors: InternalError[]) {
        super(
            `${formatMemoryRoundCompositeId(
                roundId
            )} cannot yet be published as it is missing some information.`,
            innerErrors
        );
    }
}
