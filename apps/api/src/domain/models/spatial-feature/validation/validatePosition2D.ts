import { InternalError } from '../../../../lib/errors/InternalError';
import { isValid } from '../../../domainModelValidators/Valid';
import validateCoordinate from './validateCoordinate';

export default (input: unknown): InternalError[] => {
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

    return allErrors;
};
