import { ISpatialFeature } from '../../domain/models/spatial-feature/interfaces/spatial-feature.interface';
import { convertAggregatesIdToUuid } from '../utilities/convertSequentialIdToUuid';
import buildPointTestData from './buildPointTestData';

// Note that `line` and `polygon` are future scoped
export default (): ISpatialFeature[] => [...buildPointTestData()].map(convertAggregatesIdToUuid);
