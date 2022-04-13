import { InternalError } from 'apps/api/src/lib/errors/InternalError';

export default class MissingLineContextError extends InternalError {
    constructor() {
        super(`You must specify one or more lines as part of a free multiline context`);
    }
}
