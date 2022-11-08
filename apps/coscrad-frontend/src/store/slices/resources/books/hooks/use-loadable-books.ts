import { useLoadable } from '../../shared/hooks';
import { selectLoadableBooks } from '../selectors';
import { fetchBooks } from '../thunks';

export const useLoadableBooks = () =>
    useLoadable({
        selector: selectLoadableBooks,
        fetchThunk: fetchBooks,
    });
