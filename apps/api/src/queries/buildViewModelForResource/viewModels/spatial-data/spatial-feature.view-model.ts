import {
    AggregateType,
    GeometricFeatureType,
    ISpatialFeatureProperties,
    ISpatialFeatureViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import buildDummyUuid from '../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { ISpatialFeature } from '../../../../domain/models/spatial-feature/interfaces/spatial-feature.interface';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { BaseViewModel } from '../base.view-model';

type GeometryViewModel = {
    type: GeometricFeatureType;
    coordinates: number[] | number[][] | number[][][];
};

/**
 * We have a single `SpatialFeatureViewModel` and  deal with
 * discriminating the union client-side.
 */
@CoscradDataExample<SpatialFeatureViewModel>({
    example: {
        type: AggregateType.spatialFeature,
        id: buildDummyUuid(6),
        name: {
            items: [],
        },
        geometry: {
            type: GeometricFeatureType.point,
            coordinates: [52, -123],
        },
        properties: {
            name: 'my creek',
            description: 'a nice little town',
        },
    },
})
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
    readonly properties: ISpatialFeatureProperties;

    constructor(spatialFeature: ISpatialFeature) {
        super(spatialFeature);

        const { geometry, properties } = spatialFeature;

        this.geometry = cloneToPlainObject(geometry);

        this.properties = cloneToPlainObject(properties);
    }
}
