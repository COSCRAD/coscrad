import { EdgeConnectionContextType } from 'apps/api/src/domain/models/context/types/EdgeConnectionContextType';
import { ResourceCompositeIdentifier } from 'apps/api/src/domain/models/types/entityCompositeIdentifier';
import { InternalError } from 'apps/api/src/lib/errors/InternalError';

export default class DisallowedContextTypeForResourceError extends InternalError {
    constructor(
        contextType: EdgeConnectionContextType,
        resourceCompositeIdentifier: ResourceCompositeIdentifier
    ) {
        super(`Disallowed context type for resource type`);
    }
}
