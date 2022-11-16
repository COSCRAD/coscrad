import { ResourceType } from '@coscrad/api-interfaces';
import { ResourcePage } from '../../higher-order-components/resource-page';

export const PhotographDetailContainer = (): JSX.Element => ResourcePage(ResourceType.photograph);
