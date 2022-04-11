import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { ResourceType } from '../../types/resourceTypes';

export default class InvalidPublicationStatusError extends InternalError {
    constructor(resourceType?: ResourceType) {
        const message = [
            `A DTO without a valid publication status was encountered`,
            resourceType ? `for entity of type ${resourceType}` : ``,
        ].join(' ');

        super(message);
    }
}
