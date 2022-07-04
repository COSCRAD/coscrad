import { InternalError } from '../../../lib/errors/InternalError';
import formatResourceType from '../../../view-models/presentation/formatResourceType';
import { ResourceType } from '../../types/ResourceType';

export default class InvalidResourceDTOError extends InternalError {
    constructor(resourceType: ResourceType, id?: string, innerErrors: InternalError[] = []) {
        const message = [
            `Received an invalid DTO for a ${formatResourceType(resourceType)}`,
            id ? `with ID ${id}` : ``,
        ].join(' ');

        super(message, innerErrors);
    }
}
