import { useLoadable } from '../../shared/hooks';
import { selectLoadablePhotographs } from '../selectors';
import { fetchPhotographs } from '../thunks';

// consider putting detail actions on the view model
export const useLoadablePhotographs = () => {
    const loadable = useLoadable({
        selector: selectLoadablePhotographs,
        fetchThunk: fetchPhotographs,
    });

    return loadable;
};
