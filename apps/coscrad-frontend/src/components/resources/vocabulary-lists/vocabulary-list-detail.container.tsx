import { useLoadableVocabularyListById } from '../../../store/slices/resources/vocabulary-lists/hooks/useLoadableVocabularyListById';
import { AggregateDetailContainer } from '../../higher-order-components/aggregate-detail-container';
import { VocabularyListDetailPresenter } from './vocabulary-list-detail.presenter';

export const VocabularyListDetailContainer = (): JSX.Element => (
    <AggregateDetailContainer
        useLoadableSearchResult={useLoadableVocabularyListById}
        DetailPresenter={VocabularyListDetailPresenter}
    />
);
