import { IMultilingualText } from '../common';

/**
 * Note that the naming of the property \ type is inconsistent with our usual
 * COSCRAD naming standards. Namely, the type is plural, even though it is  not
 * an array type and the property name is plural even though it is an object.
 *
 * This is because we are strictly adhering to the GEO JSON standard.
 */
export interface ISpatialFeatureProperties {
    name: IMultilingualText;
    /**
     * While one can add arbitrarily many notes about the given spatial feature,
     * the single description is what will be shown on a pop up associated with
     * a map marker.
     */
    description: IMultilingualText;

    imageUrl?: string;
}
