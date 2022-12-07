import { Line } from '../../domain/models/spatial-feature/entities/line.entity';
import { GeometricFeatureType } from '../../domain/models/spatial-feature/types/GeometricFeatureType';
import { ResourceType } from '../../domain/types/ResourceType';
import { DTO } from '../../types/DTO';

const dtos: DTO<Line>[] = [
    {
        type: ResourceType.spatialFeature,
        published: true,
        id: '1',
        geometry: {
            type: GeometricFeatureType.line,
            coordinates: [
                [52.3, -124.2],
                [52.35, -124.85],
                [52.21, -124.9],
                [52.05, -125.1],
                [52.15, -125.1],
                [52.33, -125.22],
                [52.45, -125.39],
            ],
        },
        properties: {
            name: 'Windy Path',
            description: 'One amazing hike!',
            imageUrl:
                'https://www.tsilhqotin.ca/wp-content/uploads/2022/11/tsilhqotin_language_logo_final.png',
        },
    },
];

export default (): Line[] => dtos.map((dto) => new Line(dto));
