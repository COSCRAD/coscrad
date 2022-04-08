import { Polygon } from '../../domain/models/spatial-feature/polygon.entity';
import { GeometricFeatureType } from '../../domain/models/spatial-feature/types/GeometricFeatureType';
import { PartialDTO } from '../../types/partial-dto';

const dtos: PartialDTO<Polygon>[] = [
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
        },
    },
];

export default (): Polygon[] =>
    dtos.map((dto, index) => new Polygon({ ...dto, id: `${index + 300}`, published: true }));
