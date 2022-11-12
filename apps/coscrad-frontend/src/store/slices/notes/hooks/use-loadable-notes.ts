import { useLoadable } from '../../resources/shared/hooks';
import { selectLoadableNotes } from '../selectors';
import { fetchNotes } from '../thunks';

export const useLoadableNotes = () =>
    useLoadable({
        selector: selectLoadableNotes,
        fetchThunk: fetchNotes,
    });
