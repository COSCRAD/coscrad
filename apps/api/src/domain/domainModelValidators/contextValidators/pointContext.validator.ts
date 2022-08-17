import { InternalError } from '../../../lib/errors/InternalError';
import { PointContext } from '../../models/context/point-context/point-context.entity';
import { EdgeConnectionContextType } from '../../models/context/types/EdgeConnectionContextType';
import validatePosition2D from '../../models/spatial-feature/validation/validatePosition2D';
import { isNullOrUndefined } from '../../utilities/validation/is-null-or-undefined';
import InvalidEdgeConnectionContextError from '../errors/context/InvalidEdgeConnectionContextError';
import InvalidPointTypeError from '../errors/context/InvalidPointTypeError';
import NullOrUndefinedEdgeConnectionContextDTOError from '../errors/context/NullOrUndefinedEdgeConnectionContextDTOError';
import PointNotSpecifiedError from '../errors/context/PointNotSpecifiedError';
import { Valid } from '../Valid';

export const pointContextValidator = (input: unknown): Valid | InternalError => {
    if (isNullOrUndefined(input))
        return new NullOrUndefinedEdgeConnectionContextDTOError(EdgeConnectionContextType.point2D);

    const allErrors: InternalError[] = [];

    const { point } = input as PointContext;

    if (isNullOrUndefined(point))
        return new InvalidEdgeConnectionContextError(
            EdgeConnectionContextType.point2D,
            allErrors.concat(new PointNotSpecifiedError())
        );

    const pointValidationResult = validatePosition2D(point);

    if (pointValidationResult.length > 0)
        allErrors.push(new InvalidPointTypeError(pointValidationResult));

    return allErrors.length > 0
        ? new InvalidEdgeConnectionContextError(EdgeConnectionContextType.point2D, allErrors)
        : Valid;
};
