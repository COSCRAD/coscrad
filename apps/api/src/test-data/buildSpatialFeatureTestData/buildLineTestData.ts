import { Line } from '../../domain/models/spatial-feature/line.entity';
import { GeometricFeatureType } from '../../domain/models/spatial-feature/types/GeometricFeatureType';
import { PartialDTO } from '../../types/partial-dto';

const dtos: PartialDTO<Line>[] = [
    {
        id: '1',
        geometry: {
            type: GeometricFeatureType.line,
            coordinates: [
                [1, 2],
                [1, 3],
                [1.5, 3.5],
                [3, 4.2],
            ],
        },
    },
];

export default () => dtos.map((dto) => new Line(dto));
