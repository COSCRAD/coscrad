import { EdgeConnectionContextType } from 'apps/api/src/domain/models/context/types/EdgeConnectionContextType';
import { ResourceType } from 'apps/api/src/domain/types/resourceTypes';
import { InternalError } from 'apps/api/src/lib/errors/InternalError';

export default class ContextTypeIsNotAllowedForGivenResourceTypeError extends InternalError {
    constructor(contextType: EdgeConnectionContextType, resourceType: ResourceType) {
        super(`Context type: ${contextType} is not allowed for resource type: ${resourceType}`);
    }
}
