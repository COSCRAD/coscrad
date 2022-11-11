import { useLoadableVocabularyLists } from '../../../store/slices/resources/vocabulary-lists/hooks';
import { displayLoadableWithErrorsAndLoading } from '../../higher-order-components';
import { VocabularyListIndexPresenter } from './vocabulary-list-index.presenter';

export const VocabularyListIndexContainer = (): JSX.Element => {
    const loadableVocabularyLists = useLoadableVocabularyLists();

    const Presenter = displayLoadableWithErrorsAndLoading(VocabularyListIndexPresenter);

    return <Presenter {...loadableVocabularyLists} />;
};
