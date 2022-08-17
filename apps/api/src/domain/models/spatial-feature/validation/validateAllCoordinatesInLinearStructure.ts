import { InternalError } from '../../../../lib/errors/InternalError';
import InvalidLineTypeError from '../../../domainModelValidators/errors/context/InvalidLineTypeError';
import validatePosition2D from './validatePosition2D';

export default (input: unknown): InternalError[] => {
    if (!Array.isArray(input)) return [new InvalidLineTypeError(input)];

    if (input.length < 2)
        return [new InternalError(`A linear structure must have at least 2 points`)];

    const allErrors = input.reduce((accumulatedErrors: InternalError[], coordinatePair, index) => {
        const validationResult = validatePosition2D(coordinatePair);

        if (validationResult.length > 0)
            return accumulatedErrors.concat(
                new InternalError(`Invalid 2D point coordinate at index ${index}`, validationResult)
            );

        return accumulatedErrors;
    }, []);

    return allErrors;
};
