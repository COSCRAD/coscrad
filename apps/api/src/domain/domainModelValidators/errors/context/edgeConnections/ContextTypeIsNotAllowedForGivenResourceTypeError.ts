import { InternalError } from '../../../../../lib/errors/InternalError';
import { EdgeConnectionContextType } from '../../../../models/context/types/EdgeConnectionContextType';
import { ResourceType } from '../../../../types/ResourceType';

export default class ContextTypeIsNotAllowedForGivenResourceTypeError extends InternalError {
    constructor(contextType: EdgeConnectionContextType, resourceType: ResourceType) {
        super(`Context type: ${contextType} is not allowed for resource type: ${resourceType}`);
    }
}
