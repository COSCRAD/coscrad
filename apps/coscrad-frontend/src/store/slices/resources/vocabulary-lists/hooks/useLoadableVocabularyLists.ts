import { useLoadable } from '../../shared/hooks';
import { selectLoadableVocabularyLists } from '../selectors';
import { fetchVocabularyLists } from '../thunks';

export const useLoadableVocabularyLists = () =>
    useLoadable({
        selector: selectLoadableVocabularyLists,
        fetchThunk: fetchVocabularyLists,
    });
