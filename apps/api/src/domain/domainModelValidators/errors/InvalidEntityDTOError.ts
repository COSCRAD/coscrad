import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { EntityType } from '../../types/entityTypes';

export default class InvalidEntityDTOError extends InternalError {
    constructor(entityType: EntityType, id?: string, innerErrors: InternalError[] = []) {
        const message = [
            `Received an invalid DTO for ${entityType}`,
            id ? `with ID ${id}` : ``,
        ].join(' ');

        super(message, innerErrors);
    }
}
