import { InternalError } from '../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../types/DTO';
import { TextFieldContext } from '../../../../models/context/text-field-context/text-field-context.entity';
import { EdgeConnectionContextType } from '../../../../models/context/types/EdgeConnectionContextType';
import { textFieldContextValidator } from '../../../contextValidators/textFieldContext.validator';
import EmptyTextTargetFieldInContextError from '../../../errors/context/EmptyTextTargetFieldInContextError';
import InvalidCharRangeError from '../../../errors/context/InvalidCharRangeError';
import NullOrUndefinedEdgeConnectionContextDTOError from '../../../errors/context/NullOrUndefinedEdgeConnectionContextDTOError';
import { ContextModelValidatorTestCase } from '../types/ContextModelValidatorTestCase';
import createInvalidContextErrorFactory from './utilities/createInvalidContextErrorFactory';

const validDTO: DTO<TextFieldContext> = {
    type: EdgeConnectionContextType.textField,
    target: 'term',
    charRange: [3, 5],
};

const topLevelErrorFactory = createInvalidContextErrorFactory(EdgeConnectionContextType.textField);

export const buildTextFieldContextTestCase =
    (): ContextModelValidatorTestCase<TextFieldContext> => ({
        contextType: EdgeConnectionContextType.textField,
        validator: textFieldContextValidator,
        validCases: [
            {
                dto: validDTO,
            },
        ],
        invalidCases: [
            {
                description: 'the context is empty',
                invalidDTO: null,
                expectedError: new NullOrUndefinedEdgeConnectionContextDTOError(
                    EdgeConnectionContextType.textField
                    // TODO remove cast
                ) as InternalError,
            },
            {
                description: 'the target is empty',
                invalidDTO: {
                    ...validDTO,
                    target: null,
                },
                // TODO We really should fix these type issues with `Internal Error`!
                expectedError: topLevelErrorFactory([
                    new EmptyTextTargetFieldInContextError() as InternalError,
                ]) as InternalError,
            },
            {
                description: 'the char range has its start > end',
                invalidDTO: {
                    ...validDTO,
                    charRange: [3, 1],
                },
                expectedError: topLevelErrorFactory([new InvalidCharRangeError([3, 1])]),
            },
            {
                description: 'the start index is negative',
                invalidDTO: {
                    ...validDTO,
                    charRange: [-1, 1],
                },
                expectedError: topLevelErrorFactory([new InvalidCharRangeError([-1, 1])]),
            },
            // TODO Break out type validation separately
            {
                description: 'the start index is not an integer',
                invalidDTO: {
                    ...validDTO,
                    charRange: [2.3, 3],
                },
                expectedError: topLevelErrorFactory([new InvalidCharRangeError([2.3, 3])]),
            },
            {
                description: 'the end index is not an integer',
                invalidDTO: {
                    ...validDTO,
                    charRange: [5, 9.0234],
                },
                expectedError: topLevelErrorFactory([new InvalidCharRangeError([5, 9.0234])]),
            },
        ],
    });
