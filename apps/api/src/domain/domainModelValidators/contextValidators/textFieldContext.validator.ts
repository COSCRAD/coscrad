import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { TextFieldContext } from '../../models/context/text-field-context/text-field-context.entity';
import { EdgeConnectionContextType } from '../../models/context/types/EdgeConnectionContextType';
import { isNullOrUndefined } from '../../utilities/validation/is-null-or-undefined';
import EmptyTextTargetFieldInContextError from '../errors/context/EmptyTextTargetFieldInContextError';
import InvalidCharRangeError from '../errors/context/InvalidCharRangeError';
import InvalidEdgeConnectionContextError from '../errors/context/InvalidEdgeConnectionContextError';
import NullOrUndefinedEdgeConnectionContextDTOError from '../errors/context/NullOrUndefinedEdgeConnectionContextDTOError';
import { Valid } from '../Valid';

type Integer = number;

/**
 * TODO [https://www.pivotaltracker.com/story/show/181891200]
 * We should create our own validation library.
 */
const isInteger = (input: unknown): input is Integer => Number.isInteger(input);

export const textFieldContextValidator = (input: unknown): Valid | InternalError => {
    if (isNullOrUndefined(input))
        return new NullOrUndefinedEdgeConnectionContextDTOError(
            EdgeConnectionContextType.textField
        );

    const allErrors: InternalError[] = [];

    const { target, charRange } = input as TextFieldContext;

    if (isNullOrUndefined(target)) allErrors.push(new EmptyTextTargetFieldInContextError());

    // TODO [design] How do we represent the entire text field as context? In the future `charRange` **might** be optional
    if (charRange[0] > charRange[1]) allErrors.push(new InvalidCharRangeError(charRange));

    if (charRange.some((charIndex) => charIndex < 0))
        allErrors.push(new InvalidCharRangeError(charRange));

    if (charRange.some((charIndex) => !isInteger(charIndex)))
        allErrors.push(new InvalidCharRangeError(charRange));

    return allErrors.length > 0
        ? new InvalidEdgeConnectionContextError(EdgeConnectionContextType.textField, allErrors)
        : Valid;
};
