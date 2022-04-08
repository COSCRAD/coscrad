import { IGeometricFeature } from 'apps/api/src/domain/models/spatial-feature/GeometricFeature';
import { LineCoordinates } from 'apps/api/src/domain/models/spatial-feature/types/Coordinates/LineCoordinates';
import { GeometricFeatureType } from 'apps/api/src/domain/models/spatial-feature/types/GeometricFeatureType';
import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { isValid } from '../../../Valid';
import validateAllCoordinatesInLinearStructure from './utilities/validateAllCoordinatesInLinearStructure';

const lineChainValidator = (
    input: IGeometricFeature,
    incomingErrors: InternalError[]
): InternalError[] => {
    const { type } = input;

    // Pass on the responsibility
    if (type !== GeometricFeatureType.line) return incomingErrors;

    const { coordinates } = input as IGeometricFeature<
        typeof GeometricFeatureType.line,
        LineCoordinates
    >;

    // Validate that every coordinate is a valid point
    const allErrors: InternalError[] = [];

    const coordinateValidationResult = validateAllCoordinatesInLinearStructure(coordinates);

    if (!isValid(coordinateValidationResult)) allErrors.push(...coordinateValidationResult);

    return incomingErrors.concat(allErrors);
};

export default () => lineChainValidator;
