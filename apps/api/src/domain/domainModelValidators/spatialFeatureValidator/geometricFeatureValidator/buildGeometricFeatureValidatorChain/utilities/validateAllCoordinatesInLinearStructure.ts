import { InternalError } from '../../../../../../lib/errors/InternalError';
import InvalidLineTypeError from '../../../../errors/context/InvalidLineTypeError';
import { isValid, Valid } from '../../../../Valid';
import validatePosition2D from './validatePosition2D';

export default (input: unknown): Valid | InternalError[] => {
    if (!Array.isArray(input)) return [new InvalidLineTypeError(input)];

    if (input.length < 2)
        return [new InternalError(`A linear structure must have at least 2 points`)];

    const allErrors = input.reduce((accumulatedErrors: InternalError[], coordinatePair, index) => {
        const validationResult = validatePosition2D(coordinatePair);

        if (!isValid(validationResult))
            return accumulatedErrors.concat(
                new InternalError(`Invalid 2D point coordinate at index ${index}`, validationResult)
            );

        return accumulatedErrors;
    }, []);

    if (allErrors.length > 0) return allErrors;

    return Valid;
};
