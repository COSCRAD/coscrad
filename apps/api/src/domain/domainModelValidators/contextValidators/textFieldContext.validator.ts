import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { TextFieldContext } from '../../models/context/text-field-context/text-field-context.entity';
import { EdgeConnectionContextType } from '../../models/context/types/EdgeConnectionContextType';
import { isNullOrUndefined } from '../../utilities/validation/is-null-or-undefined';
import EmptyTextTargetFieldInContextError from '../errors/context/EmptyTextTargetFieldInContextError';
import InvalidEdgeConnectionContextError from '../errors/context/InvalidEdgeConnectionContextError';
import NullOrUndefinedEdgeConnectionContextDTOError from '../errors/context/NullOrUndefinedEdgeConnectionContextDTOError';
import { Valid } from '../Valid';

export const textFieldContextValidator = (input: unknown): Valid | InternalError => {
    if (isNullOrUndefined(input))
        return new NullOrUndefinedEdgeConnectionContextDTOError(
            EdgeConnectionContextType.textField
        );

    const allErrors: InternalError[] = [];

    const { target } = input as PartialDTO<TextFieldContext>;

    if (isNullOrUndefined(target)) allErrors.push(new EmptyTextTargetFieldInContextError());

    return allErrors.length > 0
        ? new InvalidEdgeConnectionContextError(EdgeConnectionContextType.textField, allErrors)
        : Valid;
};
