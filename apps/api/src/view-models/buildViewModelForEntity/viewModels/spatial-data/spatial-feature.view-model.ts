import { IGeometricFeature } from 'apps/api/src/domain/models/spatial-feature/GeometricFeature';
import { ISpatialFeature } from 'apps/api/src/domain/models/spatial-feature/ISpatialFeature';
import cloneToPlainObject from 'apps/api/src/lib/utilities/cloneToPlainObject';
import { BaseViewModel } from '../base.view-model';

/**
 * For now, we will have a single `SpatialFeatureViewModel` and require the
 * client to deal with discriminating the union client-side.
 */
export class SpatialFeatureViewModel extends BaseViewModel {
    /**
     * We may need to make this a class so we can generate the API docs.
     */
    readonly geometry: IGeometricFeature;

    constructor({ id, geometry }: ISpatialFeature) {
        super({ id });

        this.geometry = cloneToPlainObject(geometry);
    }
}
