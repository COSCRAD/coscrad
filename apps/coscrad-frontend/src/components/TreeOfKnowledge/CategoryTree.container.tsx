import { RootState } from '../../store';
import { fetchCategoryTree } from '../../store/slices/categories';
import { useLoadable } from '../../store/slices/resources/shared/hooks';
import { FunctionalComponent } from '../../utils/types/functional-component';
import { displayLoadableWithErrorsAndLoading } from '../higher-order-components';
import { CategoryTreePresenter } from './CateogryTree.presenter';

export const CategoryTreeContainer: FunctionalComponent = (): JSX.Element => {
    const selector = (state: RootState) => state.categoryTree;

    const [loadableCategoryTree] = useLoadable({
        selector,
        fetchThunk: fetchCategoryTree,
    });

    // wrap the presenter with handling for errors and pending state
    const LoadableCategoryPresenter = displayLoadableWithErrorsAndLoading(CategoryTreePresenter);

    return <LoadableCategoryPresenter {...loadableCategoryTree} />;
};
