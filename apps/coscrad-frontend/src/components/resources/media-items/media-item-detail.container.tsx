import { ResourceType } from '@coscrad/api-interfaces';
import { ResourcePage } from '../../higher-order-components/resource-page';

export const MediaItemDetailContainer = (): JSX.Element => ResourcePage(ResourceType.mediaItem);