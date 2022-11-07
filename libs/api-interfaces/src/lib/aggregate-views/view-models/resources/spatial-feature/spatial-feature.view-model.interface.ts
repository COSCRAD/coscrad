import { IBaseViewModel } from '../../base.view-model.interface';
import { ISpatialFeatureGeometry } from './spatial-feature-geometry.interface';

export interface ISpatialFeatureViewModel<T = unknown> extends IBaseViewModel {
    geometry: ISpatialFeatureGeometry<T>;
}
