import { ISpatialFeature } from '../../../../domain/models/spatial-feature/interfaces/spatial-feature.interface';
import { BaseViewModel } from '../base.view-model';

type GeometryViewModel = {
    type: string;
    coordinates: number[] | number[][] | number[][][];
};

/**
 * For now, we will have a single `SpatialFeatureViewModel` and  deal with
 * discriminating the union client-side.
 */
export class SpatialFeatureViewModel extends BaseViewModel {
    /**
     * We may need to make this a class so we can generate the API docs.
     */
    readonly geometry: GeometryViewModel;

    constructor({ id, geometry: { type, coordinates } }: ISpatialFeature) {
        super({ id });

        this.geometry = {
            type,
            /**
             * We use nested classes in order to leverage decorator-based
             * simple invariant validation. However, the view models must
             * strictly adhere to GEO-JSON. So we handle the mapping here.
             */
            coordinates: coordinates.toPlainArray(),
        };
    }
}
