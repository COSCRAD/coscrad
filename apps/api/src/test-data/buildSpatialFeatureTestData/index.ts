import { SpatialFeature } from '../../domain/models/spatial-feature/interfaces/spatial-feature.entity';
import { convertAggregatesIdToUuid } from '../utilities/convertSequentialIdToUuid';
import buildLineTestData from './buildLineTestData';
import buildPointTestData from './buildPointTestData';
import buildPolygonTestData from './buildPolygonTestData';

export default (): SpatialFeature[] =>
    [...buildPointTestData(), ...buildLineTestData(), ...buildPolygonTestData()].map(
        convertAggregatesIdToUuid
    );
