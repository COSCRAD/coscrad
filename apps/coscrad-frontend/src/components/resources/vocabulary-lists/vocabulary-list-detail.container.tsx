import { ResourceType } from '@coscrad/api-interfaces';
import { ResourcePage } from '../../higher-order-components/resource-page';

export const VocabularyListDetailContainer = (): JSX.Element =>
    ResourcePage(ResourceType.vocabularyList);
