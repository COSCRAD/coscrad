import { selectLoadableGeneratedId } from '../selectors';
import { acquireId } from '../thunks';
import { useLoadable } from './use-loadable';

export const useLoadableGeneratedId = () =>
    useLoadable({
        selector: selectLoadableGeneratedId,
        // TODO Rename this prop `thunk`
        fetchThunk: acquireId,
    });
