import { useLoadable } from '../../shared/hooks';
import { selectLoadableTerms } from '../selectors';
import { fetchTerms } from '../thunks';

export const useLoadableTerms = () =>
    useLoadable({
        selector: selectLoadableTerms,
        // @ts-expect-error fix this
        fetchThunk: () => fetchTerms(null),
    });
