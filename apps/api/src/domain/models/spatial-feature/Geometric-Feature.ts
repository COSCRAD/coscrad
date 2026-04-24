import { FiniteNumber, NonEmptyString } from '@coscrad/data-types';
import { CoscradDataExample } from '../../../test-data/utilities';
import { GeometricFeatureType } from './types/GeometricFeatureType';

@CoscradDataExample<GeometricFeature>({
    example: {
        // @ts-expect-error avoid circular build dependacy
        type: 'Point',
        coordinates: [52, -122],
    },
})
export class GeometricFeature {
    // TODO use a proper decorator here
    @NonEmptyString({
        label: 'type',
        description: 'is this a point, line or polygon',
    })
    type: GeometricFeatureType;

    // TODO Use a Point class here
    @FiniteNumber({
        isArray: true,
        label: 'coordinates',
        description: 'the geometric coordinates for the given feature',
    })
    coordinates: [number, number];
}
