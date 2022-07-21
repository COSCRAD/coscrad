import { ResourceType } from '../../types/ResourceType';
import { Resource } from '../resource.entity';
import { IGeometricFeature } from './GeometricFeature';

export interface ISpatialFeature extends Resource {
    type: typeof ResourceType.spatialFeature;

    geometry: IGeometricFeature;
}
