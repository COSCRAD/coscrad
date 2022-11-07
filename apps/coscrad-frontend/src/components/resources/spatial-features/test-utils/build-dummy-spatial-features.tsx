import { GeometricFeatureType, ISpatialFeatureViewModel } from '@coscrad/api-interfaces';

export const buildDummySpatialFeatures = (): ISpatialFeatureViewModel[] => [
    {
        id: '1',
        geometry: {
            type: GeometricFeatureType.point,
            coordinates: [100.0, 0],
        },
    },
    {
        id: '2',
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
    {
        id: '3',
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
