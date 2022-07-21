import { InternalError } from '../../../lib/errors/InternalError';

export default class InvalidTagDTOError extends InternalError {
    constructor(dto: unknown, innerErrors: InternalError[] = []) {
        const message = [`Received an invalid tag DTO:`, JSON.stringify(dto)].join(' ');

        super(message, innerErrors);
    }
}
