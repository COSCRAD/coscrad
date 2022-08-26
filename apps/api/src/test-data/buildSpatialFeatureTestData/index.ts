import { ISpatialFeature } from '../../domain/models/spatial-feature/interfaces/spatial-feature.interface';
import buildLineTestData from './buildLineTestData';
import buildPointTestData from './buildPointTestData';
import buildPolygonTestData from './buildPolygonTestData';

export default (): ISpatialFeature[] => [
    ...buildPointTestData(),
    ...buildLineTestData(),
    ...buildPolygonTestData(),
];
