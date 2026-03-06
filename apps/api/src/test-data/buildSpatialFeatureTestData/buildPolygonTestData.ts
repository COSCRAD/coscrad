import { LanguageCode } from '@coscrad/api-interfaces';
import { buildMultilingualTextWithSingleItem } from '../../domain/common/build-multilingual-text-with-single-item';
import { IGeometricFeature } from '../../domain/models/spatial-feature/interfaces/geometric-feature.interface';
import { Polygon } from '../../domain/models/spatial-feature/polygon/entities/polygon.entity';
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
                properties: {
                    traditionalName: buildMultilingualTextWithSingleItem(
                        `Traditional Name of Point with ID: ${`${index + 300}`} Name`,
                        LanguageCode.Chilcotin
                    ),
                    contemporaryName: buildMultilingualTextWithSingleItem(
                        `Contemporary Name of Point with ID: ${`${index + 300}`} Name`,
                        LanguageCode.Chilcotin
                    ),
                    description: `Description for polygon ${`${index + 300}`}`,
                    imageUrl: 'https://coscrad.org/wp-content/uploads/2023/05/map-1272165_640.png',
                },
            })
    );
