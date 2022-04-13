import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { isValid, Valid } from '../../../../Valid';
import validateCoordinate from './validateCoordinate';

export default (input: unknown): Valid | InternalError[] => {
    if (!Array.isArray(input)) return [new InternalError(`A 2D coordinate must be an array`)];

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
