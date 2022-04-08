import { IGeometricFeature } from 'apps/api/src/domain/models/spatial-feature/GeometricFeature';
import { PointCoordinates } from 'apps/api/src/domain/models/spatial-feature/types/Coordinates/PointCoordinates';
import { GeometricFeatureType } from 'apps/api/src/domain/models/spatial-feature/types/GeometricFeatureType';
import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { isValid } from '../../../Valid';
import validatePosition2D from './utilities/validatePosition2D';

const pointChainValidator = (
    input: IGeometricFeature,
    incomingErrors: InternalError[]
): InternalError[] => {
    const { type } = input;

    // Pass on the responsibility
    if (type !== GeometricFeatureType.point) return incomingErrors;

    const { coordinates } = input as IGeometricFeature<
        typeof GeometricFeatureType.point,
        PointCoordinates
    >;

    // Validate Coordinates
    const allErrors: InternalError[] = [];

    const coordinateValidationResult = validatePosition2D(coordinates);

    if (!isValid(coordinateValidationResult)) allErrors.push(...coordinateValidationResult);

    // Add logic to validate coordinate ranges

    return incomingErrors.concat(...allErrors);
};

export default () => pointChainValidator;
