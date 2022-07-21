import { ISpatialFeature } from '../../domain/models/spatial-feature/ISpatialFeature';
import buildLineTestData from './buildLineTestData';
import buildPointTestData from './buildPointTestData';
import buildPolygonTestData from './buildPolygonTestData';

export default (): ISpatialFeature[] => [
    ...buildPointTestData(),
    ...buildLineTestData(),
    ...buildPolygonTestData(),
];
