import { InternalError } from 'apps/api/src/lib/errors/InternalError';

export default class DatabaseAlreadyInitializedError extends InternalError {
    constructor() {
        super(`You cannot initialize the database as it has already been initialized`);
    }
}
