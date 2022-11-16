import { ResourceType } from '@coscrad/api-interfaces';
import { AggregatePage } from '../../higher-order-components/aggregate-page';

export const SongDetailContainer = (): JSX.Element => AggregatePage(ResourceType.song);
