import { InternalError } from '../../../../lib/errors/InternalError';
import formatResourceCompositeIdentifier from '../../../../view-models/presentation/formatResourceCompositeIdentifier';
import { ResourceCompositeIdentifier } from '../../../types/ResourceCompositeIdentifier';

export default class ResourceNotFoundError extends InternalError {
    constructor({ type, id }: ResourceCompositeIdentifier) {
        super(
            `Failed to update resource: ${formatResourceCompositeIdentifier({
                id,
                type,
            })} as there is no ${type} with that ID`
        );
    }
}
