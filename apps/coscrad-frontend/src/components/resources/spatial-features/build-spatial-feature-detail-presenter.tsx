import {
    GeometricFeatureType,
    ICategorizableDetailQueryResult,
    ISpatialFeatureViewModel,
} from '@coscrad/api-interfaces';
import { GenericDetailPresenter } from '../../../utils/generic-components/presenters/generic-detail-presenter';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { PolygonSpatialFeatureDetailFullViewPresenter } from './polygon-spatial-feature-detail.full-view.presenter';

type Presenter = FunctionalComponent<ICategorizableDetailQueryResult<ISpatialFeatureViewModel>>;

const lookupTable: { [K in GeometricFeatureType]: Presenter } = {
    [GeometricFeatureType.line]: GenericDetailPresenter,
    [GeometricFeatureType.point]: GenericDetailPresenter,
    [GeometricFeatureType.polygon]: PolygonSpatialFeatureDetailFullViewPresenter,
};

export const buildSpatialFeatureDetailPresenter = (
    geometricFeatureType: GeometricFeatureType
): Presenter => {
    const lookupResult = lookupTable[geometricFeatureType];

    if (!lookupResult)
        throw new Error(
            `Failed to build a detail presenter for spatial feature with geometric feature type: ${geometricFeatureType}`
        );

    return lookupResult;
};
