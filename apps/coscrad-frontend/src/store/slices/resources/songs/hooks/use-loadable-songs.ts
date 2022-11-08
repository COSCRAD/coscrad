import { useLoadable } from '../../shared/hooks';
import { selectLoadableSongs } from '../selectors';
import { fetchSongs } from '../thunks';

export const useLoadableSongs = () =>
    useLoadable({
        selector: selectLoadableSongs,
        fetchThunk: fetchSongs,
    });
