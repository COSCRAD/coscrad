import { Position2D } from 'apps/api/src/domain/models/spatial-feature/types/Coordinates/Position2D';
import { DTO } from '../../../../../types/DTO';
import { PointContext } from '../../../../models/context/point-context/point-context.entity';
import { EdgeConnectionContextType } from '../../../../models/context/types/EdgeConnectionContextType';
import { pointContextValidator } from '../../../contextValidators/pointContext.validator';
import InvalidPointTypeError from '../../../errors/context/InvalidPointTypeError';
import NullOrUndefinedEdgeConnectionContextDTOError from '../../../errors/context/NullOrUndefinedEdgeConnectionContextDTOError';
import PointNotSpecifiedError from '../../../errors/context/PointNotSpecifiedError';
import { ContextModelValidatorTestCase } from '../types/ContextModelValidatorTestCase';
import createInvalidContextErrorFactory from './utilities/createInvalidContextErrorFactory';

const validDTO: DTO<PointContext> = {
    type: EdgeConnectionContextType.point2D,
    point: [2.4, 55],
};

const topLevelErrorFactory = createInvalidContextErrorFactory(EdgeConnectionContextType.point2D);

export const buildPointContextTestCase = (): ContextModelValidatorTestCase<PointContext> => ({
    contextType: EdgeConnectionContextType.point2D,
    validator: pointContextValidator,
    validCases: [{ dto: validDTO }],
    invalidCases: [
        {
            description: 'the context is empty',
            invalidDTO: null,
            expectedError: new NullOrUndefinedEdgeConnectionContextDTOError(
                EdgeConnectionContextType.point2D
            ),
        },
        {
            description: 'no point is specified',
            invalidDTO: {
                ...validDTO,
                point: null,
            },
            expectedError: topLevelErrorFactory([new PointNotSpecifiedError()]),
        },
        {
            description: 'the point has too few coordinates',
            invalidDTO: {
                ...validDTO,
                point: [3.4] as unknown as Position2D,
            },
            // TODO pass through the internal errors
            expectedError: topLevelErrorFactory([new InvalidPointTypeError([])]),
        },
        {
            description: 'the point has too many coordinates',
            invalidDTO: {
                ...validDTO,
                point: [3.4, 2.2, 0, 5.6] as unknown as Position2D,
            },
            // TODO pass through the internal errors
            expectedError: topLevelErrorFactory([new InvalidPointTypeError([])]),
        },
        // TODO consider adding some `fuzz` testing for types
        {
            description: 'the point is a string',
            invalidDTO: {
                ...validDTO,
                point: 'fooled you' as unknown as Position2D,
            },
            // TODO pass through the internal errors
            expectedError: topLevelErrorFactory([new InvalidPointTypeError([])]),
        },
    ],
});
