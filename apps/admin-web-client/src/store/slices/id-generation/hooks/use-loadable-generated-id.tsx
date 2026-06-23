import { useLoadable } from '../../resources/shared/hooks';
import { selectLoadableGeneratedId } from '../selectors';
import { acquireId } from '../thunks';

export const useLoadableGeneratedId = () =>
    useLoadable({
        selector: selectLoadableGeneratedId,
        // TODO Rename this prop `thunk`
        fetchThunk: acquireId,
    });
