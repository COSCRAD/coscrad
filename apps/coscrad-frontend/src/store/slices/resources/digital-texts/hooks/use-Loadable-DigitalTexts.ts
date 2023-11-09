import { useLoadable } from '../../shared/hooks';
import { selectLoadableDigitalTexts } from '../selectors';
import { fetchDigitalTexts } from '../thunks';

export const useLoadableDigitalTexts = () =>
    useLoadable({
        selector: selectLoadableDigitalTexts,
        fetchThunk: fetchDigitalTexts,
    });
