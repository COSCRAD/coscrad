import { InternalError } from '../../../../../../lib/errors/InternalError';
import formatResourceCompositeIdentifier from '../../../../../../view-models/presentation/formatResourceCompositeIdentifier';
import { ResourceCompositeIdentifier } from '../../../../../types/ResourceCompositeIdentifier';

export default class FreeMultilineContextOutOfBoundsError extends InternalError {
    constructor(
        resourceCompositeIdentifier: ResourceCompositeIdentifier,
        innerErrors: InternalError[]
    ) {
        const msg = [
            `Free multiline context`,
            `refers to lines that are inconsistent with`,
            `resource: ${formatResourceCompositeIdentifier(resourceCompositeIdentifier)}`,
            '\n',
            `See inner errors for more details.`,
        ].join(' ');

        super(msg, innerErrors);
    }
}
