import { ISpatialFeatureProperties } from '@coscrad/api-interfaces';
import { ResourceType } from '../../../types/ResourceType';
import { Resource } from '../../resource.entity';
import { IGeometricFeature } from './geometric-feature.interface';

export interface ISpatialFeature extends Resource {
    type: typeof ResourceType.spatialFeature;

    // TODO Use the type from `@coscrad/api-interfaces`
    geometry: IGeometricFeature;

    properties: ISpatialFeatureProperties;
}
