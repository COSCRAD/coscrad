import {
    GeometricFeatureType,
    ISpatialFeatureViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { MultilingualText } from '../../../../domain/common/entities/multilingual-text';
import { ISpatialFeature } from '../../../../domain/models/spatial-feature/interfaces/spatial-feature.interface';
import { SpatialFeatureProperties } from '../../../../domain/models/spatial-feature/point/entities/spatial-feature-properties.entity';
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
    readonly type = ResourceType.spatialFeature;

    /**
     * We may need to make this a class so we can generate the API docs.
     */
    readonly geometry: GeometryViewModel;

    /**
     * This name is in keeping with the GEOJSON standard. It holds all non-geometry
     * properties that are associated with the identity of this spatial feature.
     */
    readonly properties: SpatialFeatureProperties & { name: MultilingualText };

    constructor(spatialFeature: ISpatialFeature) {
        super(spatialFeature);

        const { geometry, properties } = spatialFeature;

        this.geometry = cloneToPlainObject(geometry);

        this.properties = cloneToPlainObject(properties);

        this.properties.name = spatialFeature.getName();
    }
}
