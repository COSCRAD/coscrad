import { ResourceType } from '@coscrad/api-interfaces';
import { AggregatePage } from '../../higher-order-components/aggregate-page';

export const TermDetailContainer = (): JSX.Element => AggregatePage(ResourceType.term);
