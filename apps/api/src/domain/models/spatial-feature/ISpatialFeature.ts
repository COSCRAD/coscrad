import { entityTypes } from '../../types/entityTypes';
import { Entity } from '../entity';
import { IGeometricFeature } from './GeometricFeature';

export interface ISpatialFeature extends Entity {
    type: typeof entityTypes.spatialFeature;

    geometry: IGeometricFeature;
}
