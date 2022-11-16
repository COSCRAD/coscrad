import { ResourceType } from '@coscrad/api-interfaces';
import { ResourcePage } from '../../higher-order-components/resource-page';

export const SpatialFeatureDetailContainer = (): JSX.Element =>
    ResourcePage(ResourceType.spatialFeature);
