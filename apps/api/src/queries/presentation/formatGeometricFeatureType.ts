import { GeometricFeatureType } from '../../domain/models/spatial-feature/types/GeometricFeatureType';
import { isNullOrUndefined } from '../../domain/utilities/validation/is-null-or-undefined';
import { InternalError } from '../../lib/errors/InternalError';
import capitalizeEveryFirstLetter from '../../lib/utilities/strings/capitalizeEveryFirstLetter';

const lookupTable: { [K in GeometricFeatureType]: string } = {
    [GeometricFeatureType.line]: 'line',
    [GeometricFeatureType.point]: 'point',
    [GeometricFeatureType.polygon]: 'polygon',
};

export const formatGeometricFeatureType = (geometricFeatureType: string): string => {
    const lookupResult = lookupTable[geometricFeatureType];

    if (isNullOrUndefined(lookupResult))
        throw new InternalError(
            `Failed to find a label for geometric feature type: ${geometricFeatureType}`
        );

    return capitalizeEveryFirstLetter(lookupResult);
};
