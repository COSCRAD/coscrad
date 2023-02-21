import { useLoadable } from '../../shared/hooks';
import { selectLoadableVideos } from '../selectors';
import { fetchVideos } from '../thunks';

export const useLoadableVideos = () =>
    useLoadable({
        selector: selectLoadableVideos,
        fetchThunk: fetchVideos,
    });
