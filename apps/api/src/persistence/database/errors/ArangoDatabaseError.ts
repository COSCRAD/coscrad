import { InternalError } from '../../../lib/errors/InternalError';

export class ArangoDatabaseError extends InternalError {
    constructor(coscradMessage: string, arangoError?: Error) {
        const arangoMessage = arangoError?.message || 'Unknown ArangoDB error.';

        super(coscradMessage, [new InternalError(arangoMessage)]);
    }
}
