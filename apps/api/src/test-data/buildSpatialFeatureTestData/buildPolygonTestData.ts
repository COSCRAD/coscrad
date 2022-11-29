import { Polygon } from '../../domain/models/spatial-feature/entities/polygon.entity';
import { IGeometricFeature } from '../../domain/models/spatial-feature/interfaces/geometric-feature.interface';
import { PolygonCoordinates } from '../../domain/models/spatial-feature/types/Coordinates/PolygonCoordinates';
import { GeometricFeatureType } from '../../domain/models/spatial-feature/types/GeometricFeatureType';
import { ResourceType } from '../../domain/types/ResourceType';

const dtos = [
    {
        geometry: {
            type: GeometricFeatureType.polygon,
            coordinates: [
                [
                    [52.47, -123.6],
                    [52.42, -123.95],
                    [52.05, -123.95],
                    [52.05, -123.685],
                ],
            ],
            // TODO Remove cast
        } as IGeometricFeature<typeof GeometricFeatureType.polygon, PolygonCoordinates>,
    },
];

export default (): Polygon[] =>
    dtos.map(
        (dto, index) =>
            new Polygon({
                ...dto,
                type: ResourceType.spatialFeature,
                id: `${index + 300}`,
                published: true,
            })
    );
