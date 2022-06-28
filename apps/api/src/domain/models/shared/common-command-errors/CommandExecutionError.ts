import { InternalError } from '../../../../lib/errors/InternalError';

export default class CommandExecutionError extends InternalError {
    constructor(innerErrors: InternalError[]) {
        super(`Command execution error.`, innerErrors);
    }
}
