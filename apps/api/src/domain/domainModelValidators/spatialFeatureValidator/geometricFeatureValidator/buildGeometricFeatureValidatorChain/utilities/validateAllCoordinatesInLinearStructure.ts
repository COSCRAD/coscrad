import { LineCoordinates } from 'apps/api/src/domain/models/spatial-feature/types/Coordinates/LineCoordinates';
import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { isValid, Valid } from '../../../../Valid';
import validatePosition2D from './validatePosition2D';

export default (input: LineCoordinates): Valid | InternalError[] => {
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
