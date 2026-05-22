import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { CoscradDataExample } from '../../../test-data/utilities';
import { DTO } from '../../../types/DTO';
import { PointCoordinates } from './point/entities/point-coordinates.entity';
import { GeometricFeatureType } from './types/GeometricFeatureType';

@CoscradDataExample<GeometricFeature>({
    example: {
        // @ts-expect-error avoid circular build dependacy
        type: 'Point',
        coordinates: new PointCoordinates({
            lattitude: 52.8,
            longitude: -122.2,
        }),
    },
})
export class GeometricFeature {
    // TODO use a proper decorator here
    @NonEmptyString({
        label: 'type',
        description: 'is this a point, line or polygon',
    })
    type: GeometricFeatureType;

    /**
     * TODO Make this a union when implementing `Line` and/or `Polygon`
     */
    @NestedDataType(PointCoordinates, {
        label: 'coordinates',
        description: 'geospatial location of this geometric feature',
    })
    coordinates: PointCoordinates;

    constructor(dto: DTO<GeometricFeature>) {
        const { type, coordinates } = dto;

        this.type = type;

        this.coordinates = new PointCoordinates(coordinates);
    }

    static fromDto(dto: DTO<GeometricFeature>) {
        return new GeometricFeature(dto);
    }
}
