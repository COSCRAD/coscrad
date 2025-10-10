import { ITermViewModel } from '@coscrad/api-interfaces';
import { ILoadable } from '../../../interfaces/loadable.interface';
import { useLoadable } from '../../shared/hooks';
import { selectTermById } from '../selectors';
import { fetchTerms } from '../thunks';

export const useLoadableTermById = (id: string): ILoadable<ITermViewModel> => {
    return useLoadable({
        selector: (state) => selectTermById(state, id),
        // TODO make this `fetchTermById`
        fetchThunk: fetchTerms,
    });
};
