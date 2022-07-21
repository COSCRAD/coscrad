import { InternalError } from '../../../../../lib/errors/InternalError';
import { IGeometricFeature } from '../../../../models/spatial-feature/GeometricFeature';
import { GeometricFeatureType } from '../../../../models/spatial-feature/types/GeometricFeatureType';

const polygonChainValidator = (
    input: IGeometricFeature,
    incomingErrors: InternalError[]
): InternalError[] => {
    const { type } = input;

    // Pass on the responsibility
    if (type !== GeometricFeatureType.polygon) return incomingErrors;

    // Validate coordinates

    const allErrors: InternalError[] = [];

    // TODO ADD remaining validation
    /**
     * Validate the 0th entry- the boundary line ring
     * Do not allow holes at this time
     */

    return incomingErrors.concat(...allErrors);
};

export default () => polygonChainValidator;
