import { useLoadable } from '../../shared/hooks';
import { selectLoadableBibliographicReferences } from '../selectors';
import { fetchBibliographicReferences } from '../thunks';

export const useLoadableBibliographicReferences = () =>
    useLoadable({
        selector: selectLoadableBibliographicReferences,
        fetchThunk: fetchBibliographicReferences,
    });
