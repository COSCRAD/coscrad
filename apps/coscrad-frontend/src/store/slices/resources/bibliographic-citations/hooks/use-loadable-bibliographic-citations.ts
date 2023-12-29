import { useLoadable } from '../../shared/hooks';
import { selectLoadableBibliographicCitations } from '../selectors';
import { fetchBibliographicCitations } from '../thunks';

export const useLoadableBibliographicCitations = () =>
    useLoadable({
        selector: selectLoadableBibliographicCitations,
        fetchThunk: fetchBibliographicCitations,
    });
