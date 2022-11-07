import { useLoadable } from '../../shared/hooks';
import { selectLoadableSpatialFeatures } from '../selectors';
import { fetchSpatialFeatures } from '../thunks';

export const useLoadableSpatialFeatures = () =>
    useLoadable({
        selector: selectLoadableSpatialFeatures,
        fetchThunk: fetchSpatialFeatures,
    });
