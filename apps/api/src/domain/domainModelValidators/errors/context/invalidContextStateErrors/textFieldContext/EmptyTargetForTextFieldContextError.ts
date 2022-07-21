import { InternalError } from '../../../../../../lib/errors/InternalError';
import formatResourceCompositeIdentifier from '../../../../../../view-models/presentation/formatResourceCompositeIdentifier';
import { ResourceCompositeIdentifier } from '../../../../../types/ResourceCompositeIdentifier';

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
