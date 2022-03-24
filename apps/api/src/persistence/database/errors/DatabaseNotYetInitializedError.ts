import { InternalError } from 'apps/api/src/lib/errors/InternalError';

export default class DatabaseNotYetInitializedError extends InternalError {
    constructor(operation?: string) {
        const msg = [
            'You cannot',
            operation || `perform this operation`,
            'as the database has yet to be initialized',
        ].join(' ');

        super(msg);
    }
}
