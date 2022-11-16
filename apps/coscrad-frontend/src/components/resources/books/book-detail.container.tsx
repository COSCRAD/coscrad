import { ResourceType } from '@coscrad/api-interfaces';
import { ResourcePage } from '../../higher-order-components/resource-page';

export const BookDetailContainer = (): JSX.Element => ResourcePage(ResourceType.book);
