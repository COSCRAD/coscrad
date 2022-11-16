import { ResourceType } from '@coscrad/api-interfaces';
import { AggregatePage } from '../../higher-order-components/aggregate-page';

export const VocabularyListDetailContainer = (): JSX.Element =>
    AggregatePage(ResourceType.vocabularyList);
