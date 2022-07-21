import { InternalError } from '../../../../../lib/errors/InternalError';

export class InvalidCommandFluxStandardActionType extends InternalError {
    constructor(innerErrors: InternalError[]) {
        super(`Received a command Flux Standard Action with invalid type.`, innerErrors);
    }
}
