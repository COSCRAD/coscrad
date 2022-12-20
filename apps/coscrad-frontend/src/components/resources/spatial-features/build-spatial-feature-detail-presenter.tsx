import {
    GeometricFeatureType,
    ICategorizableDetailQueryResult,
    ISpatialFeatureViewModel,
} from '@coscrad/api-interfaces';
import { GenericDetailPresenter } from '../../../utils/generic-components/presenters/generic-detail-presenter';
import { FunctionalComponent } from '../../../utils/types/functional-component';

type Presenter = FunctionalComponent<ICategorizableDetailQueryResult<ISpatialFeatureViewModel>>;

const lookupTable: { [K in GeometricFeatureType]: Presenter } = {
    [GeometricFeatureType.line]: GenericDetailPresenter,
    [GeometricFeatureType.point]: GenericDetailPresenter,
    [GeometricFeatureType.polygon]: GenericDetailPresenter,
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
