import { InternalError } from '../../../lib/errors/InternalError';

export default class DatabaseCannotBeDroppedError extends InternalError {
    constructor(databaseName: string) {
        const msg = [
            `You cannot drop the database ${databaseName}`,
            `as this database is not a test database`,
            `as identified by the database name`,
        ].join(' ');

        super(msg);
    }
}
