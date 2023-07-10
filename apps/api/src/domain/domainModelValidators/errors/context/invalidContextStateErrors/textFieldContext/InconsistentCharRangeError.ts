import { InternalError } from '../../../../../../lib/errors/InternalError';
import formatResourceCompositeIdentifier from '../../../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import formatCharacterRange from '../../../../../../view-models/presentation/formatCharacterRange';
import { Resource } from '../../../../../models/resource.entity';

// TODO we should really alias [number,number] already!
export default class InconsistentCharRangeError extends InternalError {
    constructor(
        charRange: [number, number],
        targetModel: Resource,
        targetField: string,
        targetValue: string
        // TODO language code?
    ) {
        const msg = [
            `The character range ${formatCharacterRange(charRange)}`,
            `is inconsistent with the value of the target property ${targetField}`,
            `on ${formatResourceCompositeIdentifier(targetModel.getCompositeIdentifier())}`,
            '\n',
            `The target value ${targetValue} has a maximal range of`,
            formatCharacterRange([0, targetValue.length]),
        ].join(' ');

        super(msg);
    }
}
