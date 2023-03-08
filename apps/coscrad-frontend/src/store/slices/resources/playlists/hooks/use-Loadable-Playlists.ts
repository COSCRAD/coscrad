import { useLoadable } from '../../shared/hooks';
import { selectLoadablePlaylists } from '../selectors';
import { fetchPlaylists } from '../thunks';

export const useLoadablePlaylists = () =>
    useLoadable({
        selector: selectLoadablePlaylists,
        fetchThunk: fetchPlaylists,
    });
