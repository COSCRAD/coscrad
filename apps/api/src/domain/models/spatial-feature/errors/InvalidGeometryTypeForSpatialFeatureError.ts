import { InternalError } from '../../../../lib/errors/InternalError';

export default class InvalidGeometryTypeForSpatialFeatureError extends InternalError {
    constructor(invalidType: unknown) {
        super(
            `Encountered an unknown geometric feature type: ${invalidType} for a spatial feature`
        );
    }
}
