import { InternalError } from '../../../../../../lib/errors/InternalError';
import formatResourceCompositeIdentifier from '../../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateCompositeIdentifier } from '../../../../../types/AggregateCompositeIdentifier';

export default class EmptyTargetForTextFieldContextError extends InternalError {
    constructor(targetModel: AggregateCompositeIdentifier, targetField: string) {
        const msg = [
            `The text value of the property ${targetField}`,
            `of resource ${formatResourceCompositeIdentifier(targetModel)}`,
            `is invalid`,
            '\n',
            `Text provided as context must be multilingual text with a value in the provided language`,
        ].join(' ');

        super(msg);
    }
}
