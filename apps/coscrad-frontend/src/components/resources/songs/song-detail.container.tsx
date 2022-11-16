import { ResourceType } from '@coscrad/api-interfaces';
import { ResourcePage } from '../../higher-order-components/resource-page';

export const SongDetailContainer = (): JSX.Element => ResourcePage(ResourceType.song);
