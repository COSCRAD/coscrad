import { entityTypes } from '../../types/entityTypes';
import { Entity } from '../entity';
import { GeometricFeature } from './GeometricFeature';

export interface ISpatialFeature extends Entity {
    type: typeof entityTypes.spatialFeature;

    geometry: GeometricFeature;
}
