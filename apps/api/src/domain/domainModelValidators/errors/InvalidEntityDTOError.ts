import { InternalError } from '../../../lib/errors/InternalError';
import { ResourceType } from '../../types/ResourceType';

export default class InvalidEntityDTOError extends InternalError {
    constructor(resourceType: ResourceType, id?: string, innerErrors: InternalError[] = []) {
        const message = [
            `Received an invalid DTO for ${resourceType}`,
            id ? `with ID ${id}` : ``,
        ].join(' ');

        super(message, innerErrors);
    }
}
