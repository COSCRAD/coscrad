import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { ResourceType } from '../../types/resourceTypes';

export default class NullOrUndefinedResourceDTOError extends InternalError {
    constructor(resourceType?: ResourceType) {
        const message = [
            `A null or undefined DTO was provided`,
            resourceType ? `for entity of type ${resourceType}` : ``,
        ].join(' ');

        super(message);
    }
}
