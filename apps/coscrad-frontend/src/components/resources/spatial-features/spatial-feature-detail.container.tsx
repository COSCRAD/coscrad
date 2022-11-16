import { ResourceType } from '@coscrad/api-interfaces';
import { AggregatePage } from '../../higher-order-components/aggregate-page';

export const SpatialFeatureDetailContainer = (): JSX.Element =>
    AggregatePage(ResourceType.spatialFeature);
