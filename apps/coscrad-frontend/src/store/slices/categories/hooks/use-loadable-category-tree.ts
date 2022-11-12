import { useLoadable } from '../../resources/shared/hooks';
import { selectCategoryTree } from '../selectors';
import { fetchCategoryTree } from '../thunks';

export const useLoadableCategoryTree = () =>
    useLoadable({
        selector: selectCategoryTree,
        fetchThunk: fetchCategoryTree,
    });
