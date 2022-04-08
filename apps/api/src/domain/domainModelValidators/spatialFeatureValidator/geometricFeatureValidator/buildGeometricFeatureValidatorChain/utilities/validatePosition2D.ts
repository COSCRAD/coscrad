import { Position2D } from 'apps/api/src/domain/models/spatial-feature/types/Coordinates/Position2D';
import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { isValid, Valid } from '../../../../Valid';
import validateCoordinate from './validateCoordinate';

export default (input: Position2D): Valid | InternalError[] => {
    const allErrors = input.reduce(
        (accumulatedErrors: InternalError[], coordinate, index) => {
            const validationResult = validateCoordinate(coordinate, index);

            return isValid(validationResult)
                ? accumulatedErrors
                : accumulatedErrors.concat(validationResult);
        },
        [
            ...(input.length === 2
                ? []
                : [new InternalError(`A 2D coordinate must have precisely 2 entries`)]),
        ]
    );

    if (allErrors.length > 0) return allErrors;

    return Valid;
};
