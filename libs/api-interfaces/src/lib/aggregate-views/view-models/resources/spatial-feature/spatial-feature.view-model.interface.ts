import { IBaseViewModel } from '../../base.view-model.interface';
import { ISpatialFeatureGeometry } from './spatial-feature-geometry.interface';
import { ISpatialFeatureProperties } from './spatial-feature-properties.interface';

export interface ISpatialFeatureViewModel<T = unknown> extends IBaseViewModel {
    geometry: ISpatialFeatureGeometry<T>;
    properties: ISpatialFeatureProperties;
}
