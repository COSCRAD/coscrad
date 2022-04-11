import { resourceTypes } from '../../types/resourceTypes';
import { Resource } from '../resource.entity';
import { IGeometricFeature } from './GeometricFeature';

export interface ISpatialFeature extends Resource {
    type: typeof resourceTypes.spatialFeature;

    geometry: IGeometricFeature;
}
