import { GeometricFeature } from 'apps/api/src/domain/models/spatial-feature/GeometricFeature';
import { PointCoordinates } from 'apps/api/src/domain/models/spatial-feature/types/Coordinates/PointCoordinates';
import { GeometricFeatureType } from 'apps/api/src/domain/models/spatial-feature/types/GeometricFeatureType';
import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { isNumber } from 'class-validator';

const pointChainValidator = (
    input: GeometricFeature,
    incomingErrors: InternalError[]
): InternalError[] => {
    const { type, coordinates } = input;

    // Pass on the responsibility
    if (type !== GeometricFeatureType.point) return incomingErrors;

    // Validate Coordinates
    const allErrors: InternalError[] = [];

    if (coordinates.length !== 2)
        allErrors.push(
            new InternalError(
                `A Geometric Point must have 2 coordinates. Received: ${coordinates.length}`
            )
        );

    const coordinateTypeErrors = (coordinates as PointCoordinates).reduce(
        (accumulatedErrors: InternalError[], coordinate, index) => {
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
        },
        []
    );

    allErrors.push(...coordinateTypeErrors);

    // Add logic to validate coordinate ranges

    return incomingErrors.concat(...allErrors);
};

export default () => pointChainValidator;
