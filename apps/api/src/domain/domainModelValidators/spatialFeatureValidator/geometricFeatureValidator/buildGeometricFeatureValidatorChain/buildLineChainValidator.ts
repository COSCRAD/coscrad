import { GeometricFeature } from 'apps/api/src/domain/models/spatial-feature/GeometricFeature';
import { LineCoordinates } from 'apps/api/src/domain/models/spatial-feature/types/Coordinates/LineCoordinates';
import { GeometricFeatureType } from 'apps/api/src/domain/models/spatial-feature/types/GeometricFeatureType';
import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { isNumber } from 'class-validator';

const lineChainValidator = (
    input: GeometricFeature,
    incomingErrors: InternalError[]
): InternalError[] => {
    const { type, coordinates } = input;

    // Pass on the responsibility
    if (type !== GeometricFeatureType.line) return incomingErrors;

    // Validate that every coordinate is a valid point
    const allErrors: InternalError[] = [];

    // TODO share this logic with PointValidator
    const coordinateTypeErrors = (coordinates as LineCoordinates)
        // We need flatmap
        .reduce((accumulatedPoints, [x, y]) => accumulatedPoints.concat(x, y), [])
        .reduce((accumulatedErrors: InternalError[], coordinate, index) => {
            if (
                !isNumber(coordinate, {
                    allowInfinity: false,
                    allowNaN: false,
                })
            )
                return accumulatedErrors.concat(
                    new InternalError(
                        `Coordinate at index [${index}] is not a number: ${coordinate}`
                    )
                );

            return accumulatedErrors;
        }, []);

    allErrors.push(...coordinateTypeErrors);

    return incomingErrors.concat(...allErrors);
};

export default () => lineChainValidator;
