import { InternalError } from '../../../../lib/errors/InternalError';

export default class InvalidCommandPayloadTypeError extends InternalError {
    constructor(type: string, innerErrors?: InternalError[]) {
        const msg = [
            `Encountered a command payload with an invalid type`,
            `on FSA for command of type ${type}.`,
            innerErrors?.length > 0 ? '\nSee inner errors for more details.' : '',
        ].join(' ');

        super(msg, innerErrors);
    }
}
