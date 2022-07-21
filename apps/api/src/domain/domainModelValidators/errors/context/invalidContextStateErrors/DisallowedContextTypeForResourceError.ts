import { InternalError } from '../../../../../lib/errors/InternalError';
import { EdgeConnectionContextType } from '../../../../models/context/types/EdgeConnectionContextType';
import { ResourceCompositeIdentifier } from '../../../../types/ResourceCompositeIdentifier';

export default class DisallowedContextTypeForResourceError extends InternalError {
    constructor(
        contextType: EdgeConnectionContextType,
        resourceCompositeIdentifier: ResourceCompositeIdentifier
    ) {
        super(
            `Disallowed context type: ${contextType} for resource type: ${resourceCompositeIdentifier}`
        );
    }
}
