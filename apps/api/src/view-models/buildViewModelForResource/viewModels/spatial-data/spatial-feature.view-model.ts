import {
    GeometricFeatureType,
    ISpatialFeatureProperties,
    ISpatialFeatureViewModel,
} from '@coscrad/api-interfaces';
import { ISpatialFeature } from '../../../../domain/models/spatial-feature/interfaces/spatial-feature.interface';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { BaseViewModel } from '../base.view-model';

type GeometryViewModel = {
    type: GeometricFeatureType;
    coordinates: number[] | number[][] | number[][][];
};

/**
 * We have a single `SpatialFeatureViewModel` and  deal with
 * discriminating the union client-side.
 */
export class SpatialFeatureViewModel extends BaseViewModel implements ISpatialFeatureViewModel {
    /**
     * We may need to make this a class so we can generate the API docs.
     */
    readonly geometry: GeometryViewModel;

    /**
     * This name is in keeping with the GEOJSON standard. It holds all non-geometry
     * properties that are associated with the identity of this spatial feature.
     */
    readonly properties: ISpatialFeatureProperties;

    constructor({ id, geometry, properties }: ISpatialFeature) {
        super({ id });

        this.geometry = cloneToPlainObject(geometry);

        this.properties = cloneToPlainObject(properties);
    }
}
