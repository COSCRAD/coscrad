import { InternalError } from '../../../../../lib/errors/InternalError';
import { PartialDTO } from '../../../../../types/partial-dto';
import { TextFieldContext } from '../../../../models/context/text-field-context/text-field-context.entity';
import { EdgeConnectionContextType } from '../../../../models/context/types/EdgeConnectionContextType';
import { textFieldContextValidator } from '../../../contextValidators/textFieldContext.validator';
import EmptyTextTargetFieldInContextError from '../../../errors/context/EmptyTextTargetFieldInContextError';
import NullOrUndefinedEdgeConnectionContextDTOError from '../../../errors/context/NullOrUndefinedEdgeConnectionContextDTOError';
import { ContextModelValidatorTestCase } from '../types/ContextModelValidatorTestCase';
import createInvalidContextErrorFactory from './utilities/createInvalidContextErrorFactory';

const validDTO: PartialDTO<TextFieldContext> = {
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
            // The char range is missing ?? this should be optional?
            // the char range has the wrong order
            // negative value for start
            // out of range end
        ],
    });
