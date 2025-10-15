import { ITermViewModel } from '@coscrad/api-interfaces';
import { ILoadable } from '../../../interfaces/loadable.interface';
import { useLoadable } from '../../shared/hooks';
import { selectTermById } from '../selectors';
import { fetchTermById } from '../thunks';

export const useLoadableTermById = (id: string): ILoadable<ITermViewModel> => {
    return useLoadable({
        selector: (state) => selectTermById(state, id),
        // TODO make this `fetchTermById`
        // @ts-expect-error Do we really need type safety here?
        fetchThunk: () => fetchTermById(id),
    });
};
