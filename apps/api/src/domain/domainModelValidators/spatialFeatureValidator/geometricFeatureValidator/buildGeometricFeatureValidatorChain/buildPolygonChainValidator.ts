import { GeometricFeature } from 'apps/api/src/domain/models/spatial-feature/GeometricFeature';
import { GeometricFeatureType } from 'apps/api/src/domain/models/spatial-feature/types/GeometricFeatureType';
import { InternalError } from 'apps/api/src/lib/errors/InternalError';

const polygonChainValidator = (
    input: GeometricFeature,
    incomingErrors: InternalError[]
): InternalError[] => {
    const { type } = input;

    // Pass on the responsibility
    if (type !== GeometricFeatureType.polygon) return incomingErrors;

    // Validate coordinates

    const allErrors: InternalError[] = [];

    // TODO
    /**
     * Validate the 0th entry- the boundary line ring
     * Do not allow holes at this time
     */

    return incomingErrors.concat(...allErrors);
};

export default () => polygonChainValidator;
