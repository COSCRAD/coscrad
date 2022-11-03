import { useLoadableVocabularyListById } from '../../../store/slices/resources/vocabulary-lists/hooks/useLoadableVocabularyListById';
import { displayLoadableSearchResult } from '../../higher-order-components/display-loadable-search-result';
import { VocabularyListDetailPresenter } from './vocabulary-list-detail.presenter';

export const VocabularyListDetailContainer = (): JSX.Element => {
    const loadableSearchResult = useLoadableVocabularyListById();

    const Presenter = displayLoadableSearchResult(VocabularyListDetailPresenter);

    return <Presenter {...loadableSearchResult} />;
};
