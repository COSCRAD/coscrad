import {
    GeometricFeatureType,
    ICategorizableDetailQueryResult,
    ISpatialFeatureViewModel,
} from '@coscrad/api-interfaces';
import { buildDummyTags } from '../../../../tags/test-utils';
import { toGeoJSON } from './to-geo-json';

type TestCase = {
    description: string;
    viewModel: ICategorizableDetailQueryResult<ISpatialFeatureViewModel>;
    expectedOutput: Omit<
        ICategorizableDetailQueryResult<ISpatialFeatureViewModel>,
        'actions' | 'tags'
    >;
};

const testCases: TestCase[] = [
    {
        description: 'when given a point with actions and tags',
        viewModel: {
            id: '1',
            geometry: {
                type: GeometricFeatureType.point,
                coordinates: [100.0, 0],
            },
            properties: {
                name: 'cool point',
                description: 'where the penguins hang out',
                imageUrl: 'https://www.pics.com/123.png',
            },
            tags: buildDummyTags(),
            actions: [],
        },

        expectedOutput: {
            id: '1',
            geometry: {
                type: GeometricFeatureType.point,
                coordinates: [100.0, 0],
            },
            properties: {
                name: 'cool point',
                description: 'where the penguins hang out',
                imageUrl: 'https://www.pics.com/123.png',
            },
        },
    },
    {
        description: 'when given a line with actions and tags',
        viewModel: {
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
            properties: {
                name: 'Dee River',
                description: 'nice swimming spot',
                imageUrl: 'https://www.pics.com/126.png',
            },
            tags: buildDummyTags(),
            actions: [],
        },
        expectedOutput: {
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
            properties: {
                name: 'Dee River',
                description: 'nice swimming spot',
                imageUrl: 'https://www.pics.com/126.png',
            },
        },
    },
    {
        description: 'when given a polygon with actions and tags',
        viewModel: {
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
            properties: {
                name: 'Dee Park',
                description: 'we play here',
                imageUrl: 'https://www.pics.com/296.png',
            },
            tags: buildDummyTags(),
            actions: [],
        },
        expectedOutput: {
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
            properties: {
                name: 'Dee Park',
                description: 'we play here',
                imageUrl: 'https://www.pics.com/296.png',
            },
        },
    },
    /**
     * Note that static analysis prevents `toGeoJSON` from being called with
     * something that doesn't have `actions` and `tags`.
     */
];

describe(`toGeoJSON`, () => {
    testCases.forEach(({ description, viewModel, expectedOutput }) =>
        describe(description, () => {
            it('should return the expected result', () => {
                const result = toGeoJSON(viewModel);

                expect(result).toEqual(expectedOutput);
            });
        })
    );
});
