import { ResourceType } from '@coscrad/api-interfaces';
import { AggregatePage } from '../../higher-order-components/aggregate-page';

export const BookDetailContainer = (): JSX.Element => AggregatePage(ResourceType.book);
