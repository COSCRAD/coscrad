import { ResourceType } from '@coscrad/api-interfaces';
import { ResourcePage } from '../../higher-order-components/resource-page';

export const TermDetailContainer = (): JSX.Element => ResourcePage(ResourceType.term);
