import { IGeometricFeature } from '../../domain/models/spatial-feature/GeometricFeature';
import { Polygon } from '../../domain/models/spatial-feature/polygon.entity';
import { PolygonCoordinates } from '../../domain/models/spatial-feature/types/Coordinates/PolygonCoordinates';
import { GeometricFeatureType } from '../../domain/models/spatial-feature/types/GeometricFeatureType';
import { ResourceType } from '../../domain/types/ResourceType';

const dtos = [
    {
        geometry: {
            type: GeometricFeatureType.polygon,
            coordinates: [
                [
                    [1.0, 3.0],
                    [2.0, 5.0],
                    [1.5, 3.7],
                    [1.2, 3.3],
                    [1.0, 3.0],
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
