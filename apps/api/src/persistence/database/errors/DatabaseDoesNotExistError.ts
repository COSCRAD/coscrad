import { InternalError } from '../../../lib/errors/InternalError';

export default class DatabaseDoesNotExistError extends InternalError {
    constructor(databaseName: string, operation?: string) {
        const msg = [
            'You cannot',
            operation || `perform this operation`,
            `as the database ${databaseName} does not exist`,
        ].join(' ');

        super(msg);
    }
}
