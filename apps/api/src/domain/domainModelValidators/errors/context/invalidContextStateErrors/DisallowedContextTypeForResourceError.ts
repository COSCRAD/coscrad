import { InternalError } from '../../../../../lib/errors/InternalError';
import { EdgeConnectionContextType } from '../../../../models/context/types/EdgeConnectionContextType';
import { ResourceCompositeIdentifier } from '../../../../models/types/entityCompositeIdentifier';

export default class DisallowedContextTypeForResourceError extends InternalError {
    constructor(
        contextType: EdgeConnectionContextType,
        resourceCompositeIdentifier: ResourceCompositeIdentifier
    ) {
        super(`Disallowed context type for resource type`);
    }
}
