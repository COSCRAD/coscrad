import { ExternalEnum, NestedDataType } from '@coscrad/data-types';
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
    // The API for this is a bit awkward. We should rework this at some point.
    @ExternalEnum(
        {
            enumName: 'GeometricFeatureType',
            enumLabel: 'geometric feature type',
            labelsAndValues: [
                {
                    label: 'point',
                    value: 'point',
                },
            ],
        },
        {
            label: 'geometric feature type',
            description: 'distinguishes points, lines, and polygons',
        }
    )
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
