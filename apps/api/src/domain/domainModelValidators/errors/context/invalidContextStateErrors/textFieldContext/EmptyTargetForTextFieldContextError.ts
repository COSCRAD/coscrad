import { ResourceCompositeIdentifier } from 'apps/api/src/domain/models/types/entityCompositeIdentifier';
import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import formatResourceCompositeIdentifier from 'apps/api/src/view-models/presentation/formatResourceCompositeIdentifier';

export default class EmptyTargetForTextFieldContextError extends InternalError {
    constructor(targetModel: ResourceCompositeIdentifier, targetField: string) {
        const msg = [
            `The text value of the property ${targetField}`,
            `of resource ${formatResourceCompositeIdentifier(targetModel)}`,
            `is invalid`,
            '\n',
            `Text provided as context must be a string with non-zero length`,
        ].join(' ');

        super(msg);
    }
}
