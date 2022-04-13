import { InternalError } from '../../../../../lib/errors/InternalError';
import { PartialDTO } from '../../../../../types/partial-dto';
import InvalidLineInFreeMultilineError from '../../../../domainModelValidators/errors/context/InvalidLineInFreeMultilineError';
import MissingLineContextError from '../../../../domainModelValidators/errors/context/MissingLineContextError';
import { FreeMultilineContext } from '../../../../models/context/free-multiline-context/free-multiline-context.entity';
import { EdgeConnectionContextType } from '../../../../models/context/types/EdgeConnectionContextType';
import { freeMultilineContextValidator } from '../../../contextValidators/freeMultilineContext.validator';
import NullOrUndefinedEdgeConnectionContextDTOError from '../../../errors/context/NullOrUndefinedEdgeConnectionContextDTOError';
import { ContextModelValidatorTestCase } from '../types/ContextModelValidatorTestCase';
import createInvalidContextErrorFactory from './utilities/createInvalidContextErrorFactory';

const validDTO: PartialDTO<FreeMultilineContext> = {
    type: EdgeConnectionContextType.freeMultiline,

    lines: [
        [
            [1, 2],
            [1.5, 2.5],
            [2.2, 3.3],
            [7, 8],
        ],
        [
            [1, 3],
            [2, 2.4],
            [2.23, 2.01],
        ],
    ],
};

const topLevelErrorFactory = createInvalidContextErrorFactory(
    EdgeConnectionContextType.freeMultiline
);

export const buildFreeMultilineTestCase =
    (): ContextModelValidatorTestCase<FreeMultilineContext> => ({
        contextType: EdgeConnectionContextType.freeMultiline,
        validator: freeMultilineContextValidator,
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
                    EdgeConnectionContextType.freeMultiline
                ) as InternalError,
            },
            {
                description: 'the line context is missing',
                invalidDTO: {
                    ...validDTO,
                    lines: null,
                },
                expectedError: topLevelErrorFactory([new MissingLineContextError()]),
            },
            {
                description: 'one of the points in the first line is invalid',
                invalidDTO: {
                    ...validDTO,
                    lines: [
                        [[1, 2], 'foo' as unknown as [number, number], [3, 4]],
                        [
                            [1, 2],
                            [2, 3],
                        ],
                    ],
                },
                expectedError: topLevelErrorFactory([new InvalidLineInFreeMultilineError(0)]),
            },
            {
                description: 'one of the points in the second line is invalid',
                invalidDTO: {
                    ...validDTO,
                    lines: [
                        [
                            [3, 43.3],
                            [4.4, 5.5],
                        ],
                        [
                            [1, 2],
                            [1, 2, 3, 4, 5],
                            [3, 4],
                        ],
                    ],
                },
                expectedError: topLevelErrorFactory([new InvalidLineInFreeMultilineError(1)]),
            },
        ],
    });
