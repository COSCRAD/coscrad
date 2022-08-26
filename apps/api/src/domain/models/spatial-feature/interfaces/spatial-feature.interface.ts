import { ResourceType } from '../../../types/ResourceType';
import { Resource } from '../../resource.entity';
import { IGeometricFeature } from './geometric-feature.interface';

export interface ISpatialFeature extends Resource {
    type: typeof ResourceType.spatialFeature;

    geometry: IGeometricFeature;
}
