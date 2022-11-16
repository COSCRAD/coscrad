import { ResourceType } from '@coscrad/api-interfaces';
import { AggregatePage } from '../../higher-order-components/aggregate-page';

export const PhotographDetailContainer = (): JSX.Element => AggregatePage(ResourceType.photograph);
