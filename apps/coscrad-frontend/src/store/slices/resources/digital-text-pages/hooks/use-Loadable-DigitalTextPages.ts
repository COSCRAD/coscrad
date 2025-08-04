import { useLoadable } from '../../shared/hooks';
import { selectLoadableDigitalTextPages } from '../selectors';
import { fetchDigitalTextPages } from '../thunks/fetchDigitalTextPages';

export const useLoadableDigitalTextPages = (id: string) =>
    useLoadable({
        selector: selectLoadableDigitalTextPages,
        fetchThunk: fetchDigitalTextPages(id),
    });
