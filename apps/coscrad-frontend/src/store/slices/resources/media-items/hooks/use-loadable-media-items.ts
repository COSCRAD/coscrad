import { useLoadable } from '../../shared/hooks';
import { selectLoadableMediaItems } from '../selectors';
import { fetchMediaItems } from '../thunks';

export const useLoadableMediaItems = () =>
    useLoadable({
        selector: selectLoadableMediaItems,
        fetchThunk: fetchMediaItems,
    });
