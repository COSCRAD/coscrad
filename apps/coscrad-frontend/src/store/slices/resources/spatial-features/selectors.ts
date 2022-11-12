import { RootState } from '../../..';
import { SPATIAL_FEATURES } from './constants';

export const selectLoadableSpatialFeatures = (state: RootState) => state[SPATIAL_FEATURES];
