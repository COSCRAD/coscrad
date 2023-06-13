import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResourceType } from '../../../../types/ResourceType';

export default class ContextTypeIsNotAllowedForGivenResourceTypeError extends InternalError {
    constructor(contextType: string, resourceType: ResourceType) {
        super(`Context type: ${contextType} is not allowed for resource type: ${resourceType}`);
    }
}
