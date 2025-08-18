import { InternalError } from '../../../../lib/errors/InternalError';
import { AggregateId } from '../../../types/AggregateId';

// TODO why are some error files named -error instead of .error
export class MemoryRoundIsNotReadyForPublicationError extends InternalError {
    constructor(roundId: AggregateId, innerErrors: InternalError[]) {
        super(
            `Memory match round ${roundId} cannot yet be published as it is missing some information.`,
            innerErrors
        );
    }
}
