import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { EntityType } from '../../types/entityTypes';

export default class InvalidPublicationStatusError extends InternalError {
    constructor(entityType?: EntityType) {
        const message = [
            `A DTO without a valid publication status was encountered`,
            entityType ? `for entity of type ${entityType}` : ``,
        ].join(' ');

        super(message);
    }
}
