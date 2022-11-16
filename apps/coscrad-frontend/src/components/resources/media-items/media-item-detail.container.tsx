import { ResourceType } from '@coscrad/api-interfaces';
import { AggregatePage } from '../../higher-order-components/aggregate-page';

export const MediaItemDetailContainer = (): JSX.Element => AggregatePage(ResourceType.mediaItem);
