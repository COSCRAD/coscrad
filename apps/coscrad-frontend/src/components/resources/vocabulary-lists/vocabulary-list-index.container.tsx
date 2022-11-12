import { useLoadableVocabularyLists } from '../../../store/slices/resources/vocabulary-lists/hooks';
import { AggregateIndexContainer } from '../../higher-order-components/aggregate-index-container';
import { VocabularyListIndexPresenter } from './vocabulary-list-index.presenter';

export const VocabularyListIndexContainer = (): JSX.Element => (
    <AggregateIndexContainer
        useLoadableModels={useLoadableVocabularyLists}
        IndexPresenter={VocabularyListIndexPresenter}
    />
);
